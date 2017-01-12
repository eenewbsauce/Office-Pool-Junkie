const baseUrl           = 'https://www.officepooljunkie.com';
const poolsEndpoint     = `${baseUrl}/mypools.php`;
const cheerio           = require('cheerio');
const request           = require('request');
const R                 = require('ramda');
const querystring       = require('querystring');

const teams             = require('../compare/teams');
const cookieJar         = require('./cookiejar');
const userAgent         = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.95 Safari/537.36';

class Pages {
  setPoolId(pool) {
    this.poolId = pool.link.split('=')[1];
  }

  getPoolId() {
    return this.poolId;
  }

  listRead() {
    console.log('getting pools');
    let self = this;

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

        self.setPoolId(cleanPools[0]);

        resolve({
          link: cleanPools[0].link,
          week: cleanPools[0].week
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
                away: {
                  name: cells.eq(3).text(),
                  abbv: cells.eq(2).find('input').attr('value')
                },
                home: {
                  name: cells.eq(6).text(),
                  abbv: cells.eq(5).find('input').attr('value')
                },
                game: {
                  name: cells.eq(0).find('input').attr('name'),
                  value: cells.eq(0).find('input').attr('value')
                }
              });
            });

            let cleanMatchups = R.filter(m => {
              return !R.isEmpty(m.away.name) && !R.isEmpty(m.home.name);
            }, matchups);

            resolve({
              matchups: cleanMatchups,
              week: data.week,
              h: $('input[name="h"]').attr('value')
            });
        });
    });
  }

  poolWrite(data, standings) {
      console.log('making selections');

      return new Promise((resolve, reject) => {
          let selections = teams.create(standings).getSelections(data, this.getPoolId());
          let formData = querystring.stringify(selections);

          request({
              url: `${baseUrl}/picks_pickem.php`,
              method: 'POST',
              headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                  'Connection': 'Keep-Alive',
                  'Host': 'www.officepooljunkie.com',
                  'Origin': 'https://www.officepooljunkie.com',
                  'Upgrade-Insecure-Requests': 1,
                  'User-Agent': userAgent,
                  'Cache-Control': 'no-cache',
                  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                  'Accept-encoding': 'gzip, deflate, br',
                  'Accept-Language': 'en-US,en;q=0.8'
              },
              jar: cookieJar.getCookie(),
              qs: {Pool: this.poolId},
              formData: formData
          }, (err, res, body) => {
              if (err) {
                  return reject(err);
              }

              resolve(body);
          });
      });
  }
}

module.exports = function() {
  return new Pages();
};
