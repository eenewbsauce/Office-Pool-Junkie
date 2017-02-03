let standings = require('./standings');
let schedule = require('./schedule');
let teams = require('./teams');

class Stats {
    static get(useSaved = false) {
        console.log('fetching stats...');

        if (useSaved) {
          console.log('stats fetching complete!');
          
          return Promise.resolve(require('../data/store/statsData'));
        }

        return Promise.all([
            standings(),
            schedule(),
            teams()
        ])
            .then(results => {
                console.log('stats fetching complete!');

                return {
                    standings: results[0],
                    schedule: results[1],
                    teams: results[2]
                }
            });
    }
}

module.exports = Stats;
