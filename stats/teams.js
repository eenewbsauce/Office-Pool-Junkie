const request   = require('request');
const R         = require('ramda');

function teams() {
    return new Promise((resolve, reject) => {
        request({
            url: 'http://www.nhl.com/stats/rest/team?isAggregate=false&reportType=basic&isGame=false&reportName=teamsummary&sort=[{%22property%22:%22points%22,%22direction%22:%22DESC%22},{%22property%22:%22wins%22,%22direction%22:%22DESC%22}]&cayenneExp=gameTypeId=2%20and%20seasonId%3E=20172018%20and%20seasonId%3C=20172018',
            method: 'GET',
            json: true
        }, (err, res, body) => {
            if (err) {
                return reject(err);
            }

            let teams = {};

            R.forEach(team => {
                teams[team.teamAbbrev] = team;
            }, body.data);

            resolve(teams);
        });
    });
}

module.exports = teams;
