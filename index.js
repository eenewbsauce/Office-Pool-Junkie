const auth      = require('./scraping/auth')();
const pages     = require('./scraping/pages')();
const stats     = require('./stats');
const compare   = require('./compare');

// auth.login()
//   .then(res => {
//     console.dir(res.message)
//   }, err => {
//     console.log('failed to login');
//   })
//   .then(pages.poolsList)
//   .then(res => {
//     console.dir(res.pools);
//   }, err => {
//     console.log('error fetching pools');
//   });

stats.standings()
  .then(standings => {
      let winner = compare.teams
          .create(standings)
          .aVsB(standings[0].team.name, standings[1].team.name);

      console.log(winner.name);
  });
