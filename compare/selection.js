const Helper = require('./helpers');

class Selection {
    constructor(data, poolId, crossRefToWinners = false) {
        this.compareList = {};
        this.list = {};
        this.crossRefToWinners = crossRefToWinners;
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

        if (this.crossRefToWinners) {
          this.list['Winner' + idx] = this._assignWinner(matchup.game.winner);
        }

        this.list['Pick' + idx] = this._assignWinner(aVsB.winner.abbreviation);

        this.compareList[`${matchup.game.name}Audit`] = aVsB.compare;
    }

    _assignWinner(winner) {
      return Helper.abbvReverseMap().hasOwnProperty(winner)
       ? Helper.abbvReverseMap()[winner]
       : winner;
    }

    get() {
        return Object.assign(
          {},
          this.list,
          this.suffix,
          this.crossRefToWinners
            ? this._calculateSelectionToWinnerPercentage()
            : {}
        );
    }

    getWithCompares() {
        return this.compareList;
    }

    _calculateSelectionToWinnerPercentage() {
      let wins = 0;

      Object.keys(this.list).forEach(item => {
        if (item.indexOf('Pick') !== -1) {
          let numericPart = item.match(/\d+/g);
          if (this.list[item] === this.list[`Winner${numericPart}`]) {
            wins++;
          }
        }
      });

      return {
        percentageSelectionToWins: '%' + ((wins/this.suffix.Gcount) * 100).toFixed(2)
      };
    }
}

module.exports = Selection;
