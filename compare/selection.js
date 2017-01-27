const Helper = require('./helpers');

class Selection {
    constructor(data, poolId) {
        this.compareList = {};
        this.list = {};
        this.suffix = {
            Week: data.week,
            Pool: poolId,
            Gcount: data.matchups.length,
            h: data.h,
            submit_picks: 'Save and Apply'
        };
    }

    add(matchup, aVsB, i) {
        let idx = i + 1;
        this.list[matchup.game.name] = parseInt(matchup.game.value);
        this.list['Pick' + idx] = Helper.abbvReverseMap().hasOwnProperty(aVsB.winner.abbreviation)
         ? Helper.abbvReverseMap()[aVsB.winner.abbreviation]
         : aVsB.winner.abbreviation;
         this.compareList[`${matchup.game.name}Audit`] = aVsB.compare;
    }

    get() {
        return Object.assign({}, this.list, this.suffix);
    }

    getWithCompares() {
        return this.compareList;
    }
}

module.exports = Selection;
