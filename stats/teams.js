const request   = require('request');
const R         = require('ramda');

function teams() {
    return new Promise((resolve, reject) => {
        request({
            url: 'http://www.nhl.com/stats/rest/grouped/team/basic/season/teamsummary?cayenneExp=seasonId=20162017%20and%20gameTypeId=2&factCayenneExp=gamesPlayed%3E=1&sort=[{%22property%22:%22wins%22,%22direction%22:%22DESC%22},{%22property%22:%22points%22,%22direction%22:%22DESC%22}]',
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
