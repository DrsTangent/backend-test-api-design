var contributorServices = require("../services/contributors.services")

async function getMonthlyContributors(req, res, next){
    let organization = req.params.organization;
    let repository = req.params.repository;
    let year = req.params.year;
    let month = req.params.month;
  
    let contributors = await contributorServices.getMonthlyContributors(organization, repository, year, month)

    res.status(200).send(contributors)

}

async function getYearlyContributors(req, res, next) {
    let organization = req.params.organization;
    let repository = req.params.repository;
    let year = req.params.year;
  
    let contributors = await contributorServices.getYearlyContributors(organization, repository, year)

    res.status(200).send(contributors)
}

module.exports = {getMonthlyContributors, getYearlyContributors}