const { Organizations } = require("../models/organizations.models");
const { createOrganization } = require("../repos/organizations.repos");
const { addBulkRepositories } = require("../repos/repositories.repos");
const { addBulkUsers } = require("../repos/users.repos");
const { fetchOrganizationRepos, fetchRepoContributors } = require("../utils/github-reqs");

async function fetchOrganizationData(orgName){
    
    //Create Organization If not Available Already//
    console.log('Getting Org')
    let org = await Organizations.findOne({name: orgName})
    if(!org){
        org = await createOrganization(orgName);
    }

    console.log('Getting Repos')
    //Fetch Repos//
    let organization_repos = await fetchOrganizationRepos(orgName);
    console.log('Adding Repos')
    let repositories = await addBulkRepositories(orgName, organization_repos)

    //Go Through Contributors of Repositories
    for(let i = 0; i<repositories.length; i++){
        console.log('Getting Contributors for ' + repositories[i].name)
        let repo_contributors = await fetchRepoContributors(orgName, repositories[i].name);
        console.log('Adding Contributors for ' + repositories[i].name);
        let contributors = await addBulkUsers(orgName, repositories[i].name, repo_contributors);
    }
}


module.exports = {fetchOrganizationData}