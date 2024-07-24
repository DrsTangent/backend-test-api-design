var githubServices = require("../services/github.services")

async function fetchOrganizationData(req, res, next){
    let orgName = req.params.orgName;
    githubServices.fetchOrganizationData(orgName)

    res.status(200).send({message: "your request has been submitted, orgnaization data will be fetched in few minutes"})
}

module.exports = {fetchOrganizationData}