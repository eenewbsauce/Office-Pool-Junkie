const stats     = require('./stats');
const teams     = require('./compare').teams;

new stats().get()
    .then(data => {
       console.dir(data);
    });

