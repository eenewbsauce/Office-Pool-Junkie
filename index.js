const auth  = require('./lib/auth')();
const pages = require('./lib/pages')();

auth.login()
  .then(res => {
    console.dir(res.message)
  }, err => {
    console.log('failed to login');
  })
  .then(pages.poolsList)
  .then(res => {
    console.dir(res.pools);
  }, err => {
    console.log('error fetching pools');
  })
