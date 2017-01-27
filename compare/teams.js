const Helper    = require('./helpers');
const R         = require('ramda');
const Selection = require('./selection');

class Teams {
    constructor(stats, algorithm) {
        this.stats = stats;
        this.algorithm = algorithm;
        this.helper = new Helper(algorithm, stats);
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
                [compare.a.team.abbreviation]: Object.assign(
                    {},
                    compare.aAdvAudit,
                    { awp: compare.aActualWinningPercentage },
                    { cwp: compare.aCalculatedWinningPercentage }
                ),
                [compare.b.team.abbreviation]: Object.assign(
                    {},
                    compare.bAdvAudit,
                    { awp: compare.bActualWinningPercentage },
                    { cwp: compare.bCalculatedWinningPercentage }
                ),
            }
        };
    }
}

module.exports = {
    create: function(stats, algorithm) {
        return new Teams(stats, algorithm);
    }
}
