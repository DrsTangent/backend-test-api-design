const { Repositories } = require("../models/repositories.model");
const { Users } = require("../models/users.model");

async function createUser(name, email){
    let user = await Users.create({name: name, email: email})
    return user;
}

async function addBulkUsers(orgName, repoName, contributors){
    console.log(repoName, orgName);
    const repo = await Repositories.findOne({
        'fullName.organization': orgName,
        'fullName.repository': repoName
    });
    let contributorObjs = []
    if(repo){
        for(let i = 0; i<contributors.length; i++){
            try{
                console.log(contributors[i])
                let user = new Users(contributors[i]);
                await user.save();
                repo.contributors.push({userId: user._id, firstCommit: contributors[i].firstCommit});
                contributorObjs.push(user);
            }
            catch(err){
                let user = await Users.findOne({username: contributors[i].username});
                repo.contributors.push({userId: user._id, firstCommit: contributors[i].firstCommit});
                if(user){
                    contributorObjs.push(user);
                }
            }
        }
        repo.lastFetchedDate=new Date();
        await repo.save()
    }
    else{
        console.log("Repository Not Found");
    }

    return contributors;
}

module.exports = {createUser, addBulkUsers}