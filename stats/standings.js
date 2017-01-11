const request   = require('request');
const R         = require('ramda');

function standings() {
    return new Promise((resolve, reject) => {
        request({
            url: 'https://statsapi.web.nhl.com/api/v1/standings?expand=standings.record,standings.team,standings.division,standings.conference,team.schedule.next,team.schedule.previous&season=20162017',
            method: 'GET',
            json: true
        }, (err, res, body) => {
            if (err) {
                return reject(err);
            }

            let standings = R.compose(
                R.sortWith([R.descend(R.prop('points'))]),
                R.flatten,
                R.pluck('teamRecords')
            )(body.records);

            resolve(standings);
        });
    });
}

module.exports = standings;
