const fs = require('fs');
const options = require('../options').parse();

class Matchups {
  static get() {
    return options.useSavedMatchups
      ? require('./store/matchupsData')
      : {};
  }

  static set(matchups) {
    return options.shouldSaveMatchups
      ? fs.writeFileSync(
          './store/matchupsData.json',
          JSON.stringify(matchups, null, 4)
        )
      : {};
  }
}

class Stats {
  static get() {
    return options.useSavedStats
      ? fs.writeFileSync(
          'statsData.json',
          JSON.stringify(stats, null, 4)
        )
      : {};
  }

  static set() {
    if (options.shouldSaveStats) {
      fs.writeFileSync(
        './store/statsData.json',
        JSON.stringify(stats, null, 4)
      );
    }
  }
}

class Selections {
  // constructor() {
  //   this.selections = options.shouldSaveSelections
  //     ? require('./store/selectionData')
  //     : {};
  // }

  static get() {

  }

  static set(selectionData) {
    if (options.shouldSaveSelections) {
      let isoDate = new Date().toISOString();

      this.selections[`${options.selectionAlgorithm}:${isoDate}`] = Object.assign(
          {},
          selectionData.selections,
          { compareAudit: selectionData.selectionsWithCompares }
      );

      fs.writeFileSync(
        './store/selectionData.json',
        JSON.stringify(results, null, 4)
      );
    }
  }
}

module.exports = {
  Matchups: Matchups,
  Stats: Stats,
  Selections: Selections
};
