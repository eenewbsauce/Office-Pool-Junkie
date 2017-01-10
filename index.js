const auth      = require('./scraping/auth')();
const pages     = require('./scraping/pages')();
const stats     = require('./stats');
let standings;

auth.login()
    .then(res => {
        console.dir(res.message)
    }, err => {
        console.log('failed to login');
    })
    .then(stats.standings)
    .then(data => {
        standings = data;
    })
    .then(pages.listRead.bind(pages))
    .then(pages.poolRead)
    .then(data => {
        return pages.poolWrite(data, standings);
    })
    .then(() => {
        console.log('all done ; )');
    });
