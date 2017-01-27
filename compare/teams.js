const Helper    = require('./helpers');
const R         = require('ramda');
const Selection = require('./selection');

class Teams {
    constructor(standings, algorithm) {
        this.standings = standings;
        this.algorithm = algorithm;
        this.helper = new Helper(algorithm, standings);
    }

    getSelections(data, poolId) {
        let selection = new Selection(data, poolId);

        data.matchups.forEach((m, i) => {
            let aVsB = this.aVsB(m.home.abbv, m.away.abbv);

            selection.add(m, aVsB, i);
        });

        return {
            selections: selection.get(),
            selectionsWithCompares: selection.getWithCompares()
        };
    }

    aVsB(abbvA, abbvB) {
        let compare = this.helper.digest(abbvA, abbvB);

        let winner = compare.aAdv > compare.bAdv
          ? compare.a.team
          : compare.b.team;

        return {
            winner: winner,
            compare: {
                [compare.a.team.abbreviation]: compare.aAdvAudit,
                [compare.b.team.abbreviation]: compare.bAdvAudit
            }
        };
    }
}

module.exports = {
    create: function(standings, algorithm) {
        return new Teams(standings, algorithm);
    }
}
