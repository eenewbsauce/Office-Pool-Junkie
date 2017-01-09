const auth      = require('./scraping/auth')();
const pages     = require('./scraping/pages')();

auth.login()
    .then(res => {
        console.dir(res.message)
    }, err => {
        console.log('failed to login');
    })
    .then(pages.listRead)
    .then(pages.poolRead)
    .then(data => {
        console.log(data.matchups);
    })
