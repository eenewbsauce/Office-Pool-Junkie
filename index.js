const fs        = require('fs');
const auth      = require('./scraping/auth')();
const pages     = require('./scraping/pages')();
const Stats     = require('./stats');
const stats     = new Stats();
const options   = require('./options').parse();
let statsStore;
let results;
let matchupsData;
let statsData;

try {
  matchupsData = options.useSavedMatchups
    ? require('./matchupsData')
    : {};
  statsData = options.useSavedStats
    ? require('./statsData')
    : {};
  results = require('./selectionData.json');
} catch (err) {
  results = {};
  console.log('Cannot perform requested action. Please check node args.');
  process.exit()
}

if (options.useSavedMatchups && !options.useSavedStats) {
    console.log('using saved matchups');

    stats.get()
        .then(data => {
            saveStats(data);
        }, err => {
            console.log('error fetching stats');
        })
        .then(data => {
            return pages.poolWrite(matchupsData, statsStore, options.selectionAlgorithm, options.submitSelections);
        })
        .then(selectionData => {
            saveSelections(selectionData);
            console.log('all done ; )');
        });
} else if (options.useSavedMatchups && options.useSavedStats) {
    console.log('using saved matchups and stats');

    pages.poolWrite(matchupsData, statsData, options.selectionAlgorithm, options.submitSelections)
        .then(selectionData => {
            saveSelections(selectionData);
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
            saveStats(data);
        }, err => {
            console.log('error fetching stats');
        })
        .then(pages.listRead.bind(pages))
        .then(pages.poolRead)
        .then(data => {
            saveMatchups(data);
            return pages.poolWrite(data, statsStore, options.selectionAlgorithm, options.submitSelections);
        })
        .then(selectionData => {
            saveSelections(selectionData);
            console.log('all done ; )');
        });
}

function saveSelections(selectionData) {
    console.dir(selectionData.selections);

    if (options.shouldSaveSelections) {
        let isoDate = new Date().toISOString();
        results[`${options.selectionAlgorithm}:${isoDate}`] = Object.assign(
            {},
            selectionData.selections,
            { compareAudit: selectionData.selectionsWithCompares }
        );
        fs.writeFileSync('selectionData.json', JSON.stringify(results, null, 4));
    }
}

function saveMatchups(matchups) {
    if (options.shouldSaveMatchups) {
        fs.writeFileSync('matchupsData.json', JSON.stringify(matchups, null, 4));
    }
}

function saveStats(stats) {
    statsStore = stats;

    if (options.shouldSaveStats) {
        fs.writeFileSync('statsData.json', JSON.stringify(stats, null, 4));
    }
}
