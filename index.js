const fs        = require('fs');
const auth      = require('./scraping/auth')();
const pages     = require('./scraping/pages')();
const Stats     = require('./stats');
const stats     = new Stats();

const argv      = require('minimist')(process.argv.slice(2));
const selectionAlgorithm = argv.algo || 'latest';
const submitSelections = !!argv.submitSelections;
const shouldSaveMatchups = !!argv.shouldSaveMatchups;
const shouldSaveSelections = !!argv.shouldSaveSelections;
const shouldSaveStats = !!argv.shouldSaveStats;
const useSavedMatchups = !!argv.useSavedMatchups;
const useSavedStats = !!argv.useSavedStats;

// console.dir(argv);
// process.exit();

let statsStore;
let results;
let matchupsData;

try {
  results = require('results.json');
  matchupsData = useSavedMatchups
    ? require('matchupsData.json')
    : [];
} catch (err) {
  results = {};
}

if (useSavedMatchups) {
    console.log('using saved matchups');

    stats.get()
        .then(data => {
            saveStats(data);
        }, err => {
            console.log('error fetching stats');
        })
        .then(data => {
            return pages.poolWrite(matchupsData, statsStore.standings, selectionAlgorithm, submitSelections);
        })
        .then(selections => {
            saveSelections(selections);
            console.log('all done ; )');
        });
} else if (useSavedMatchups && useSavedStats) {
    console.log('using saved matchups and stats');

    pages.poolWrite(data, statsStore.standings, selectionAlgorithm, submitSelections)
        .then(selections => {
            saveSelections(selections);
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
            return pages.poolWrite(data, statsStore.standings, selectionAlgorithm, submitSelections);
        })
        .then(selections => {
            saveSelections(selections);
            console.log('all done ; )');
        });
}

function saveSelections(selections) {
    console.dir(selections);

    if (shouldSaveSelections) {
        let isoDate = new Date().toISOString();
        results[`${selectionAlgorithm}:${isoDate}`] = selections;
        fs.writeFileSync('selectionData.json', JSON.stringify(results, null, 4));
    }
}

function saveMatchups(matchups) {
    if (shouldSaveMatchups) {
        fs.writeFileSync('matchupsData.json', JSON.stringify(matchups, null, 4));
    }
}

function saveStats(stats) {
    statsStore = stats;

    if (shouldSaveStats) {
        fs.writeFileSync('statsData.json', JSON.stringify(stats, null, 4));
    }
}
