const loginEndpoint = 'https://www.officepooljunkie.com/login.php';
const email         = process.env.OFFICE_POOL_JUNKIE_EMAIL;
const password      = process.env.OFFICE_POOL_JUNKIE_PASSWORD;
const request       = require('request');

const cookieJar     = require('./cookiejar');

class Auth {
  login() {
      console.log('logging in');
      return new Promise((resolve, reject) => {
      request({
          url: loginEndpoint,
          method: 'POST',
          form: {
              Email: email,
              Password: password
          }
      }, (err, res, body) => {
        if (err) {
          return reject(err);
        }

        cookieJar.setCookie(res.headers['set-cookie'][0]);

        resolve({message: 'logged in!'});
      });
    });
  };
}

module.exports = function() {
  return new Auth();
}
