const stats     = require('./stats');
const teams     = require('./compare').teams;

stats.standings()
  .then(standings => {
      let winner = teams
          .create(standings)
          .getSelections();
          // .aVsB(standings[0].team.name, standings[1].team.name);

      console.log(winner.name);
  });
