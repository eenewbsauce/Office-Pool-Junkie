const baseUrl       = 'https://www.officepooljunkie.com';
const poolsEndpoint = `${baseUrl}/mypools.php`;
const cheerio       = require('cheerio');
const request       = require('request');

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

        let pools = rows.map((i, el) => {
            return cheerio(el).find('a.tooltip').attr('href');
        });

        resolve({
          link: pools[1]
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

            let matchups = rows.map((i, el) => {
                return cheerio(el).find('td').eq(3).text();
            });

            resolve({
              matchups: matchups
            });
        });
    });
  }
}

module.exports = function() {
  return new Pages();
};
