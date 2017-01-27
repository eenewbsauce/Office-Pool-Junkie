let standings = require('./standings');
let schedule = require('./schedule');
let teams = require('./teams');

class Stats {
    get() {
        console.log('fetching stats...');

        return Promise.all([
            standings(),
            schedule(),
            teams()
        ])
            .then(results => {
                return {
                    standings: results[0],
                    schedule: results[1],
                    teams: results[2]
                }
            });
    }
}

module.exports = Stats;
