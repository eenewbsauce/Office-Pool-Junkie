const poolsEndpoint = 'https://www.officepooljunkie.com/mypools.php';
const cheerio       = require('cheerio');
const request       = require('request');

const cookieJar     = require('./cookiejar');

class Pages {
  poolsList() {
    console.log('getting pools');
    return new Promise((resolve, reject) => {
      request({
        url: poolsEndpoint,
        method: 'GET',
        // headers: cookieJar.getRequestHeaders(),
        jar: cookieJar.getCookie()
      }, (err, res, body) => {
        if (err) {
          return reject(err);
        }

        let $ = cheerio.load(body);
        let pools = $('.create tr').html();

        resolve({
          pools: pools
        });
      });
    });
  };
}

module.exports = function() {
  return new Pages();
}
