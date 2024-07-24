const { Organizations } = require("../models/organizations.models");
const { Repositories } = require("../models/repositories.model");

async function createRepository(orgName, repoName){
    const org = await Organizations.findOne({ name: orgName });

    if(org){
        var repository = new Repositories({
            name: repoName,
            fullName: {
                organization: orgName,
                repository: repoName
            }
        });
        await repository.save();

        org.repositories.push(repository._id);

        await org.save()
    }
    else{
        console.log("Organization not found");
    }
    console.log(org);
    return repository;
}

async function addBulkRepositories(orgName, repos){
    const org = await Organizations.findOne({ name: orgName }).populate('repositories');
    try{
        const insertedRepos = await Repositories.insertMany(repos, { ordered: false });

        // Add the new repositories' IDs to the organization
        org.repositories.push(...insertedRepos.map(repo => repo._id));
        await org.save();
    }
    catch(err){
        console.log("Error While Adding Repos");
    }
    console.log(org.repositories.length);
    return org.repositories;
}

module.exports = {createRepository, addBulkRepositories}