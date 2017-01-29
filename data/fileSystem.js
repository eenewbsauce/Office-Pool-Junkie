const fs = require('fs');
const path = require('path');
const options = require('../options').parse();

class Matchups {
  static get() {
    try {
      return require('./store/matchupsData');
    } catch(err) {
      throw new Error('Matchups do not exist. Try "NPM run populate" first');
    }
  }

  static set(matchups) {
    if (options.shouldSaveMatchups) {
      return fs.writeFileSync(
        path.resolve(__dirname, 'store/matchupsData.json'),
        JSON.stringify(matchups, null, 4)
      );
    }
  }
}

class Stats {
  static get() {
    try {
      return require('./store/statsData');
    } catch(err) {
      throw new Error('Stats do not exist. Try "NPM run populate" first');
    }
  }

  static set(stats) {
    if (options.shouldSaveStats) {
      fs.writeFileSync(
        path.resolve(__dirname, 'store/statsData.json'),
        JSON.stringify(stats, null, 4)
      );
    }
  }
}

class Selections {
  constructor() {
    try {
      this.selections = fs.readFileSync(
        path.resolve(__dirname, 'store/selectionData.json')
      );
    } catch (err) {
      this.selections = {};
    }
  }

  get() {
    return this.selections || {};
  }

  set(selectionData) {
    if (selectionData) {
      console.dir(selectionData, {depth:null});
    }

    if (options.shouldSaveSelections) {
      let isoDate = new Date().toISOString();

      this.selections[`${options.selectionAlgorithm}:${isoDate}`] = Object.assign(
          {},
          selectionData.selections,
          { compareAudit: selectionData.selectionsWithCompares }
      );

      fs.writeFileSync(
        path.resolve(__dirname, 'store/selectionData.json'),
        JSON.stringify(this.selections, null, 4)
      );
    }
  }
}

module.exports = {
  Matchups: Matchups,
  Stats: Stats,
  Selections: Selections
};
