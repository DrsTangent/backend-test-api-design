const { Repositories } = require("../models/repositories.model");

async function getMonthlyContributors(orgName, repoName, year, month) {
    // Validate year and month
    if (isNaN(year) || year < 1970 || isNaN(month) || month < 0 || month > 11) {
        throw new Error("Invalid year or month. Year must be >= 1970, and month must be between 0 (January) and 11 (December).");
    }

    try {
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999); // End of the month

        const repository = await Repositories.findOne({
            'fullName.organization': orgName,
            'fullName.repository': repoName
        }).populate('contributors.userId', 'name email username');;

        if (!repository) {
            throw new Error(`Repository with organization: ${orgName} and repository: ${repoName} not found.`);
        }

        const monthlyContributors = repository.contributors.filter(contributor => {
            return contributor.firstCommit >= startDate && contributor.firstCommit <= endDate;
        }).map(contributor => ({
            username: contributor.userId.username,
            name: contributor.userId.name,
            email: contributor.userId.email,
            firstCommit: contributor.firstCommit
        }));;
        
        return {
            'org': orgName,
            'repository': repoName,
            'year': year,
            'month': month,
            'newContributors': monthlyContributors
        }
    } catch (error) {
        console.error('Error fetching monthly contributors:', error);
        throw error;
    }
}


async function getYearlyContributors(orgName, repoName, year) {
    // Validate year
    if (isNaN(year) || year < 1970) {
        throw new Error("Invalid year. Year must be >= 1970.");
    }

    try {
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31, 23, 59, 59, 999); // End of the year

        const repository = await Repositories.findOne({
            'fullName.organization': orgName,
            'fullName.repository': repoName
        }).populate('contributors.userId', 'name email username');;

        if (!repository) {
            throw new Error(`Repository with organization: ${orgName} and repository: ${repoName} not found.`);
        }

        const yearlyContributors = repository.contributors.filter(contributor => {
            return contributor.firstCommit >= startDate && contributor.firstCommit <= endDate;
        }).map(contributor => ({
            username: contributor.userId.username,
            name: contributor.userId.name,
            email: contributor.userId.email,
            firstCommit: contributor.firstCommit
        }));;

        return {
            'org': orgName,
            'repository': repoName,
            'year': year,
            'newContributors': yearlyContributors
        }
    } catch (error) {
        console.error('Error fetching yearly contributors:', error);
        throw error;
    }
}

module.exports = {getMonthlyContributors, getYearlyContributors}