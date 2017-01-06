const request       = require('request');
const poolsEndpoint = 'https://www.officepooljunkie.com/mypools.php';
const cheerio       = require('cheerio');

const Base          = require('./base');

class Pages extends Base {
  constructor() {
    super();
  }

  poolsList() {
    return new Promise((resolve, reject) => {
      this.request({
        url: poolsEndpoint,
        method: 'GET'
      }, (err, res, body) => {
        if (err) {
          return reject(err);
        }

        let $ = cheerio.load(body);
        let pools = $('tr').html();

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
