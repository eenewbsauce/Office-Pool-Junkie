const auth      = require('./scraping/auth')();
const pages     = require('./scraping/pages')();
const Stats     = require('./stats');
const stats     = new Stats();
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
        return pages.poolWrite(data, statsStore.standings);
    })
    .then(selections => {
        console.dir(selections);
        console.log('all done ; )');
    });
