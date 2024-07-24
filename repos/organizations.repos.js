const { Organizations } = require("../models/organizations.models");

async function createOrganization(orgName){
    let org = await Organizations.create({name: orgName})
    return org;
}

module.exports = {createOrganization}