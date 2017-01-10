const helper    = require('./helpers');
const R         = require('ramda');
const Selection = require('./selection');

class Teams {
    constructor(standings) {
        this.standings = standings;
    }

    getSelections(data, poolId) {
        let selection = new Selection(data, poolId);
        data.matchups.forEach((m, i) => {
            let winner = this.aVsB(m.home.abbv, m.away.abbv);

            selection.add(m, winner, i);
        });

        return selection.get();
    }

    aVsB(abbvA, abbvB) {
        let teamA = helper.findTeamInStandings(abbvA, this.standings);
        let teamB = helper.findTeamInStandings(abbvB, this.standings);

        let compare = {
          a: teamA,
          aAdv: 0,
          b: teamB,
          bAdv: 0
        };

        helper.assignPointsAdv(compare);
        helper.assignStreakAdv(compare);

        return compare.aAdv > compare.bAdv
          ? teamA.team
          : teamB.team;
    }
}

module.exports = {
    create: function(standings) {
        return new Teams(standings);
    }
}
