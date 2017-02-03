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

    let chunkSize = options.chunkSize || matchups.length;

    for (let i = 0; i < Math.floor(matchups.length/chunkSize); i++) {
        let beginning = i * chunkSize;
        let ending = (i + 1) * chunkSize;
        let selections = teams.create(statsStore, options.selectionAlgorithm)
            .getSelections({ matchups: matchups.slice(beginning, ending) }, uuid(), true);

        console.log(`For ${beginning}-${ending}: ${selections.selections.percentageSelectionToWins}`);


        if (i === 0) {
            fs.writeFileSync(
                path.resolve(__dirname, 'data/store/backtestData.json'),
                JSON.stringify(selections, null, 4)
            );
        }
    }
  });
