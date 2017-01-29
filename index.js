const fs          = require('fs');
const auth        = require('./scraping/auth')();
const pages       = require('./scraping/pages')();
const stats  = require('./stats');
const options     = require('./options').parse();
const Matchups    = require('./data').fileSystem.Matchups;
const Stats       = require('./data').fileSystem.Stats;
const Selections  = require('./data').fileSystem.Selections;

let statsStore;

const matchupsData = Matchups.get();
const statsData = Stats.get();
const selections = Selections.get();

// try {
//   matchupsData = options.useSavedMatchups
//     ? require('./matchupsData')
//     : {};
//   statsData = options.useSavedStats
//     ? require('./statsData')
//     : {};
//   results = require('./selectionData.json');
// } catch (err) {
//   console.dir(err)
//   console.log('Cannot perform requested action. Please check node args.');
//   process.exit()
// }

if (options.useSavedMatchups && !options.useSavedStats) {
    console.log('using saved matchups');

    stats.get()
        .then(data => {
            Stats.set(data);
        }, err => {
            console.log('error fetching stats');
        })
        .then(data => {
            return pages.poolWrite(matchupsData, statsStore, options.selectionAlgorithm, options.submitSelections);
        })
        .then(selectionData => {
            Selections.set(selectionData);
            console.log('all done ; )');
        });
} else if (options.useSavedMatchups && options.useSavedStats) {
    console.log('using saved matchups and stats');

    pages.poolWrite(matchupsData, statsData, options.selectionAlgorithm, options.submitSelections)
        .then(selectionData => {
            Selections.set(selectionData);
            console.log('all done ; )');
        });
} else {
    console.log('performing live selection');

    auth.login()
        .then(res => {
            console.dir(res.message)
        }, err => {
            console.log('failed to login');
        })
        .then(stats.get)
        .then(data => {
            Stats.set(data);
        }, err => {
            console.log('error fetching stats');
        })
        .then(pages.listRead.bind(pages))
        .then(pages.poolRead)
        .then(data => {
            Matchups.set(data);
            return pages.poolWrite(data, Stats.get(), options.selectionAlgorithm, options.submitSelections);
        })
        .then(selectionData => {
            Selections.set(selectionData);
            console.log('all done ; )');
        });
}

// function saveSelections(selectionData) {
//     console.dir(selectionData.selections);
//
//     if (options.shouldSaveSelections) {
//         let isoDate = new Date().toISOString();
//         results[`${options.selectionAlgorithm}:${isoDate}`] = Object.assign(
//             {},
//             selectionData.selections,
//             { compareAudit: selectionData.selectionsWithCompares }
//         );
//         fs.writeFileSync('selectionData.json', JSON.stringify(results, null, 4));
//     }
// }
//
// function saveMatchups(matchups) {
//     if (options.shouldSaveMatchups) {
//         fs.writeFileSync('matchupsData.json', JSON.stringify(matchups, null, 4));
//     }
// }
//
// function saveStats(stats) {
//     statsStore = stats;
//
//     if (options.shouldSaveStats) {
//         fs.writeFileSync('statsData.json', JSON.stringify(stats, null, 4));
//     }
// }
