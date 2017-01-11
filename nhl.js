const stats     = require('./stats');
const teams     = require('./compare').teams;

stats.standings()
    .then(standings => {
        console.log('**** standings');
        console.dir(standings);
    })
    .then(stats.schedule)
    .then(schedule => {
        console.log('**** schedule');
        console.dir(schedule);
    })
    .then(stats.teams)
    .then(teams => {
        console.log('**** teams');
        console.dir(teams);
    });
