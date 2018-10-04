const request   = require('request');
const R         = require('ramda');

function schedule() {
    return new Promise((resolve, reject) => {
        let startDate = '2018-10-04';
        let endDate = new Date().toISOString().split('T')[0];

        request({
            url: `https://statsapi.web.nhl.com/api/v1/schedule?startDate=${startDate}&endDate=${endDate}&expand=schedule.teams,schedule.linescore,schedule.broadcasts.all,schedule.ticket,schedule.game.content.media.epg,schedule.radioBroadcasts,schedule.game.seriesSummary,seriesSummary.series&leaderCategories=&leaderGameTypes=R&site=en_nhl&teamId=&gameType=&timecode=`,
            method: 'GET',
            json: true
        }, (err, res, body) => {
            if (err) {
                return reject(err);
            }

            let schedule = R.compose(
                function(data) {
                    return data;
                },
                R.pluck('teams'),
                R.flatten,
                R.pluck('games')
            )(body.dates);

            resolve(schedule);
        });
    });
}

module.exports = schedule;
