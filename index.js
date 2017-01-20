const fs        = require('fs');
const auth      = require('./scraping/auth')();
const pages     = require('./scraping/pages')();
const Stats     = require('./stats');
const stats     = new Stats();
const selectionAlgorithm = process.argv[2] || 'latest';
let results;
try {
  results = require('results.json');
} catch (err) {
  results = {};
}
let statsStore;

auth.login()
    .then(res => {
        console.dir(res.message)
    }, err => {
        console.log('failed to login');
    })
    .then(stats.get)
    .then(data => {
        statsStore = data;
    }, err => {
        console.log('error fetching stats');
    })
    .then(pages.listRead.bind(pages))
    .then(pages.poolRead)
    .then(data => {
        return pages.poolWrite(data, statsStore.standings, selectionAlgorithm);
    })
    .then(selections => {
        console.dir(selections);
        fs.appendFileSync('results.json', JSON.stringify(selections, null, 4));
        console.log('all done ; )');
    });
