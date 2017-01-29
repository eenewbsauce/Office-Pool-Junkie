const fs          = require('fs');
const auth        = require('./scraping/auth')();
const pages       = require('./scraping/pages')();
const stats       = require('./stats');
const options     = require('./options').parse();
const Matchups    = require('./data').fileSystem.Matchups;
const Stats       = require('./data').fileSystem.Stats;
const Selections  = require('./data').fileSystem.Selections;

const selections = new Selections();

//NPM run useSaved
if (options.useSavedMatchups && options.useSavedStats) {
    console.log('using saved matchups and stats');

    pages.poolWrite(Matchups.get(), Stats.get(), options.selectionAlgorithm, options.submitSelections)
        .then(selectionData => {
            selections.set(selectionData);
            console.log('all done ; )');
        })
        .catch(err => {
          console.dir(err)
        });
}
//NPM start and NPM run populate
else {
  if (options.submitSelections) {
    console.log('performing live selection');
  } else {
    console.log('populating matchups and stats');
  }

  let matchupsStore;
  let statsStore;

  auth.login()
      .then(res => {
          console.log(res.message)
      }, err => {
          console.log('failed to login');
      })
      .then(stats.get)
      .then(data => {
          statsStore = data;
          Stats.set(data);
      }, err => {
          console.log('error fetching stats');
      })
      .then(pages.listRead.bind(pages))
      .then(pages.poolRead)
      .then(data => {
          matchupsStore = data;
          Matchups.set(data);
          return pages.poolWrite(matchupsStore, statsStore, options.selectionAlgorithm, options.submitSelections);
      })
      .then(selectionData => {
          selections.set(selectionData);
          console.log('all done ; )');
      })
      .catch(err => {
        console.dir(err)
      });
}
