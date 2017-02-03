const R         = require('ramda');
const uuid      = require('uuid/v1');
const fs        = require('fs');
const path      = require('path');

const Stats     = require('./stats');
const compare   = require('./compare');
const teams     = compare.teams;
const helper    = compare.helpers;

const options   = require('./options').parse();

let statsStore;
let matchups;

Stats.get(options.useSavedStats)
  .then(stats => (statsStore = stats))
  .then(() => {
    matchups = R.map(game => {
      let awayAbbv = helper.abbvReverseMap[game.away.team.abbreviation]
        || game.away.team.abbreviation
      let homeAbbv = helper.abbvReverseMap[game.home.team.abbreviation]
        || game.home.team.abbreviation

      return {
        away: {
          name: game.away.team.name,
          abbv: awayAbbv
        },
        home: {
          name: game.home.team.name,
          abbv: homeAbbv
        },
        game: {
          name: `${awayAbbv} @ ${homeAbbv}`,
          value: uuid(),
          winner: game.home.score > game.away.score
            ? homeAbbv
            : awayAbbv
        }
      }
    }, statsStore.schedule);

    matchups = R.filter(m => {
      return (m.away.abbv !== 'PAC' && m.home.abbv !== 'PAC')
        && (m.away.abbv !== 'ATL' && m.home.abbv !== 'ATL')
        && (m.away.abbv !== 'CEN' && m.home.abbv !== 'CEN')
        && (m.away.abbv !== 'MET' && m.home.abbv !== 'MET')

    }, matchups);

    let selections = teams.create(statsStore, options.selectionAlgorithm)
      .getSelections({ matchups: matchups }, uuid(), true)

    console.log(selections.selections.percentageSelectionToWins)

    fs.writeFileSync(
      path.resolve(__dirname, 'data/store/backtestData.json'),
      JSON.stringify(selections, null, 4)
    );
  })
