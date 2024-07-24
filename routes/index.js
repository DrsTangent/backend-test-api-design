var express = require('express');
var router = express.Router();
var contributorController = require("../controllers/contributors.controllers")
var githubController = require("../controllers/github.controllers")
/* GET home page. */
router.get('/:organization/:repository/:year', contributorController.getYearlyContributors);

router.get('/:organization/:repository/:year/:month', contributorController.getMonthlyContributors);

router.get('/fetch-org-data/:orgname', githubController.fetchOrganizationData)

module.exports = router;
