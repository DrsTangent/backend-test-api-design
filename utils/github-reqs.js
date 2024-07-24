var axios = require('axios');

const githubInstance = axios.create({
    baseURL: 'https://api.github.com/',
    headers: {'Authorization': "bearer " + process.env.GITHUB_TOKEN}
});

async function fetchRepositoriesInBatches(urls, batchSize = 100) {
    const allRepositories = [];
  
    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);
      const requests = batch.map(url => githubInstance.get(url));
  
      try {
        const responses = await Promise.all(requests);
        responses.forEach(response => allRepositories.push(...response.data));
      } catch (error) {
        console.error('Error fetching batch:', error);
      }
    }
  
    return allRepositories;
  }

function repoMap(repo){
    let fullName = repo.full_name.split('/');
    return {
        name: repo.name,
        fullName: {
            organization: fullName[0],
            repository: fullName[1]
        }
    }
}

async function fetchOrganizationRepos(orgName){
    //Check for Limiter and Make a Request//
    await rateLimiterTimeout(1);
    let res = await githubInstance.get('/orgs/'+orgName+'/repos?page=1');

    //Check for Repos Links, Then Check if Limiter is allowing and make Requests
    let allReposLinks = generatePageUrls(res.headers.link);
    await rateLimiterTimeout(allReposLinks.length);
    let repos = await fetchRepositoriesInBatches(allReposLinks)
    repos.push(...res.data);
    let mappedRepos = repos.map(rep=>repoMap(rep))
    return mappedRepos;
}

async function fetchRepoContributors(orgName, repoName){
  //Check for Limiter and Make a Request//
  await rateLimiterTimeout(1);
  let res = await githubInstance.get('/repos/'+orgName+'/'+repoName+'/contributors?page=1');

  //Check for Contributors Links, Then Check if Limiter is allowing and make Requests
  let allContributorsLinks = generatePageUrls(res.headers.link);
  await rateLimiterTimeout(allContributorsLinks.length);
  let contributors = await fetchRepositoriesInBatches(allContributorsLinks)
  contributors.push(...res.data);
  let detailedContributors = await fetchContributorsFirstCommit(orgName, repoName, contributors);
  let simplifiedContributors = [];
  for(let i = 0; i<detailedContributors.length; i++){
    try{
      let contributor = {
        username: detailedContributors[i].author.login,
        name: detailedContributors[i].commit.author.name,
        email: detailedContributors[i].commit.author.email,
        firstCommit: detailedContributors[i].commit.author.date,
      }
      simplifiedContributors.push(contributor);
    }catch(err){
      console.log("error occured while adding user");
    }
  }
  console.log(simplifiedContributors);
  console.log(simplifiedContributors.length);
  return simplifiedContributors;
}



async function fetchContributorsFirstCommit(orgName, repoName, contributors, batchSize=100){
  const detailedContributors = [];
  
  for (let i = 0; i < contributors.length; i += batchSize) {
    const batch = contributors.slice(i, (i+batchSize < contributors.length)?i + batchSize:contributors.length);
    const requests = batch.map(contributor => githubInstance.get(`https://api.github.com/repos/${orgName}/${repoName}/commits?author=${contributor.login}`));

    try {
      let responses = await Promise.all(requests);
      const remainingRequests = [];
      responses.forEach(res => {
        if(!res.headers.link){
          detailedContributors.push(res.data.slice(-1)[0])
        }
        else{
          let lastPage = generatePageUrls(res.headers.link).slice(-1)[0];
          remainingRequests.push(githubInstance.get(lastPage))
        }
      });
      responses = await Promise.all(remainingRequests);
      responses.forEach(response => {
        detailedContributors.push(response.data.slice(-1)[0])
      })
    } catch (error) {
      console.error('Error fetching batch:', error);
    }
  }
  
  return detailedContributors;
}

async function rateLimiterTimeout(reqNum){
    let res = await githubInstance.get('/rate_limit')
    let remaining = res.data.resources.core.remaining;
    let reset = res.data.resources.core.reset;
    let time = reset - Date.now();
    if(remaining < reqNum){
        console.log("Rate limit reached, waiting for reset")
        await new Promise(resolve => setTimeout(resolve, time));
    }
}

function generatePageUrls(linkHeader) {
    if (!linkHeader) {
      return [];
    }
  
    let nextPageUrl = null;
    let lastPageUrl = null;
  
    
    // Parse the link header
    const links = linkHeader.split(',').map(link => link.trim());
    for (const link of links) {
      const [urlPart, relPart] = link.split(';').map(part => part.trim());
      const url = urlPart.slice(1, -1); // Remove angle brackets
      const rel = relPart.split('=')[1].slice(1, -1); // Remove quotes
  
      if (rel === 'next') {
        nextPageUrl = url;
      } else if (rel === 'last') {
        lastPageUrl = url;
      }
    }
  
    if (!nextPageUrl || !lastPageUrl) {
      return [];
    }
  
    // Extract page numbers from URLs
    const nextPageNumber = parseInt(new URL(nextPageUrl).searchParams.get('page'));
    const lastPageNumber = parseInt(new URL(lastPageUrl).searchParams.get('page'));
  
    const baseUrl = nextPageUrl.split('?')[0];
  
    // Generate URLs for all pages from next to last
    const urls = [];
    for (let pageNumber = nextPageNumber; pageNumber <= lastPageNumber; pageNumber++) {
      urls.push(`${baseUrl}?page=${pageNumber}`);
    }
  
    return urls;
  }

module.exports = {fetchOrganizationRepos, fetchRepoContributors}