const helper = require('./helpers');

class Selection {
    constructor(data, poolId) {
        this.list = {
          Week: data.week,
          Pool: poolId,
          Gcount: data.matchups.length,
          h: data.h,
          submit_picks: 'Save and Apply'
        };
    }

    add(matchup, winner, i) {
        let idx = i + 1;
        this.list[matchup.game.name] = matchup.game.value;
        this.list['Pick' + idx] = helper.abbvReverseMap.hasOwnProperty(winner.abbreviation)
         ? helper.abbvReverseMap[winner.abbreviation]
         : winner.abbreviation;
    }

    get() {
      return this.list;
    }
}

module.exports = Selection;
