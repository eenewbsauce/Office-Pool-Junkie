const helper = require('./helpers');

class Selection {
    constructor(data, poolId) {
        this.list = {};
        this.suffix = {
            Week: data.week,
            Pool: poolId,
            Gcount: data.matchups.length,
            h: data.h,
            submit_picks: 'Save and Apply'
        };
    }

    add(matchup, winner, i) {
        let idx = i + 1;
        this.list[matchup.game.name] = parseInt(matchup.game.value);
        this.list['Pick' + idx] = helper.abbvReverseMap.hasOwnProperty(winner.abbreviation)
         ? helper.abbvReverseMap[winner.abbreviation]
         : winner.abbreviation;
    }

    get() {
        this.list.Gcount = this.suffix.Gcount;
        this.list.Week = this.suffix.Week;
        this.list.h = this.suffix.h;
        this.list.Pool = this.suffix.Pool;
        this.list.submit_picks = this.suffix.submit_picks;

        return this.list;
    }
}

module.exports = Selection;
