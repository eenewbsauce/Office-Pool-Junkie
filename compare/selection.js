const helper = require('./helpers');

class Selection {
    constructor(matchup, winner, i) {
        let idx = i + 1;
        this[matchup.game.name] = matchup.game.value;
        this['Pick' + idx] = winner.abbreviation;
    }
}

module.exports = Selection;
