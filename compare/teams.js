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
            let winner = this.aVsB(m.home.abbv, m.away.abbv);

            selection.add(m, winner, i);
        });

        return selection.get();
    }

    aVsB(abbvA, abbvB) {
        let compare = this.helper.digest(abbvA, abbvB);

        return compare.aAdv > compare.bAdv
          ? compare.a.team
          : compare.b.team;
    }
}

module.exports = {
    create: function(standings, algorithm) {
        return new Teams(standings, algorithm);
    }
}
