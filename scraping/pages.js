const baseUrl = "https://www.officepooljunkie.com";
const poolsEndpoint = `${baseUrl}/my-pools.php`;
const cheerio = require("cheerio");
const request = require("request");
const R = require("ramda");
const querystring = require("querystring");

const teams = require("../compare").teams;
const cookieJar = require("./cookiejar");
const userAgent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.95 Safari/537.36";
const options = require("../options").parse();

class Pages {
  setPoolId(pool) {
    this.poolId = pool.link.split("=")[1];
  }

  getPoolId() {
    return this.poolId;
  }

  listRead() {
    console.log("getting pools");
    let self = this;

    return new Promise((resolve, reject) => {
      request(
        {
          url: poolsEndpoint,
          method: "GET",
          jar: cookieJar.getCookie()
        },
        (err, res, body) => {
          if (err) {
            return reject(err);
          }

          let $ = cheerio.load(body);
          let rows = $(".container .card");
          let pools = [];

          rows.each((i, el) => {
            let weekParts = $(el)
              .find(".card-body .col-md-auto.text-nowrap p")
              .eq(0)
              .text()
              .split(":");
            let number = weekParts[0].split(" ")[1];
            let status = weekParts[1].trim().toLowerCase();
            let complete = status === "pool over" || status === "no games";
            let title = $(el).find("h4.card-title a");

            if (title.text().indexOf("NHL") !== -1) {
              pools.push({
                link: title.attr("href"),
                week: parseInt(number),
                isComplete: complete
              });
            }
          });

          console.dir(pools);

          let cleanPools = R.compose(
            R.sortWith([R.ascend(R.prop("week"))]),
            R.filter(p => {
              return !p.isComplete;
            })
          )(pools);

          self.setPoolId(cleanPools[0]);

          console.dir(cleanPools);

          resolve({
            link: cleanPools[0].link,
            week: cleanPools[0].week
          });
        }
      );
    });
  }

  poolRead(data) {
    console.log("go to pool page");

    return new Promise((resolve, reject) => {
      request(
        {
          url: `${baseUrl}/${data.link}`,
          method: "GET",
          jar: cookieJar.getCookie()
        },
        (err, res, body) => {
          if (err) {
            return reject(err);
          }

          let $ = cheerio.load(body);
          let rows = $(".table-responsive tbody tr");
          let matchups = [];

          rows.each((i, el) => {
            let cells = cheerio(el).find("td");
            matchups.push({
              away: {
                name: cells
                  .eq(1)
                  .find(".col-6.text-nowrap")
                  .text()
                  .split("(")[0],
                abbv: cells
                  .eq(1)
                  .attr("onclick")
                  .split("'")[5]
              },
              home: {
                name: cells
                  .eq(2)
                  .find(".col-6.text-nowrap")
                  .text()
                  .split("(")[0],
                abbv: cells
                  .eq(2)
                  .attr("onclick")
                  .split("'")[5]
              },
              game: {
                name: cells
                  .eq(0)
                  .find("input")
                  .attr("name"),
                value: cells
                  .eq(0)
                  .find("input")
                  .attr("value")
              }
            });
          });

          let cleanMatchups = R.filter(m => {
            return !R.isEmpty(m.away.name) && !R.isEmpty(m.home.name);
          }, matchups);

          resolve({
            matchups: cleanMatchups,
            week: data.week,
            h: $('input[name="h"]').attr("value")
          });
        }
      );
    });
  }

  poolWrite(data, stats, algorithm, submitResults) {
    return new Promise((resolve, reject) => {
      let selectionData;

      if (options.shouldSaveSelections) {
        console.log(`making selections with algorithm: ${algorithm}`);
        selectionData = teams
          .create(stats, algorithm)
          .getSelections(data, this.getPoolId());
      } else {
        resolve();
      }

      if (!submitResults) {
        return resolve(selectionData);
      }

      request(
        {
          url: `${baseUrl}/picks-pickem.php`,
          method: "POST",
          headers: {
            Connection: "keep-alive",
            "User-Agent": userAgent,
            "Cache-Control": "no-cache"
          },
          jar: cookieJar.getCookie(),
          qs: { Pool: this.poolId },
          form: selectionData.selections
        },
        (err, res, body) => {
          if (err) {
            return reject(err);
          }

          resolve(selectionData);
        }
      );
    });
  }
}

module.exports = function() {
  return new Pages();
};
