const helper    = require('./helpers');
const R         = require('ramda');
const Selection = require('./selection');

class Teams {
    constructor(standings) {
        this.standings = standings;
    }

    getSelections(matchups) {
        return matchups.map((m, i) => {
            let winner = this.aVsB(m.home, m.away);

            return new Selection(m, winner, i);
        });
    }

    aVsB(nameA, nameB) {
        let teamA = helper.findTeamInStandings(nameA, this.standings);
        let teamB = helper.findTeamInStandings(nameB, this.standings);

        return R.sortWith([
            R.descend(R.prop('points'))
        ])([teamA, teamB])[0].team;
    }
}

module.exports = {
    create: function(standings) {
        return new Teams(standings);
    }
}
