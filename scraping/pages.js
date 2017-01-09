const baseUrl       = 'https://www.officepooljunkie.com';
const poolsEndpoint = `${baseUrl}/mypools.php`;
const cheerio       = require('cheerio');
const request       = require('request');
const R             = require('ramda');

const cookieJar     = require('./cookiejar');

class Pages {
  listRead() {
    console.log('getting pools');

    return new Promise((resolve, reject) => {
      request({
        url: poolsEndpoint,
        method: 'GET',
        jar: cookieJar.getCookie()
      }, (err, res, body) => {
        if (err) {
          return reject(err);
        }

        let $ = cheerio.load(body);
        let rows = $('.create tr');
        let pools = [];

        rows.each((i, el) => {
          let cells = cheerio(el).find('td');

          pools.push({
              link: cells.eq(0).find('a.tooltip').attr('href'),
              week: parseInt(cells.eq(1).text().split(':')[0].split(' ')[1]) || undefined
          });
        });

        let cleanPools = R.compose(
            R.sortWith([R.descend(R.prop('week'))]),
            R.filter(p => {
              return !R.isNil(p.week) && typeof p.week === 'number';
            })
        )(pools);

        resolve({
          link: cleanPools[0].link
        });
      });
    });
  }

  poolRead(data) {
    console.log('go to pool page');

    return new Promise((resolve, reject) => {
        request({
            url: `${baseUrl}/${data.link}`,
            method: 'GET',
            jar: cookieJar.getCookie()
        }, (err, res, body) => {
            if (err) {
                return reject(err);
            }

            let $ = cheerio.load(body);
            let rows = $('.sheet tr');
            let matchups = [];

            rows.each((i, el) => {
              let cells = cheerio(el).find('td');
              matchups.push({
                away: cells.eq(3).text(),
                home: cells.eq(6).text()
              });
            });

            let cleanMatchups = R.filter(m => {
              console.log(m)
              return !R.isEmpty(m.away) && !R.isEmpty(m.home);
            }, matchups);

            resolve({
              matchups: cleanMatchups
            });
        });
    });
  }
}

module.exports = function() {
  return new Pages();
};
