const requestLib    = require('request');
const loginEndpoint = 'https://www.officepooljunkie.com/login.php';
const email         = process.env.OFFICE_POOL_JUNKIE_EMAIL;
const password      = process.env.OFFICE_POOL_JUNKIE_PASSWORD;

const Base          = require('./base');

class Auth extends Base {
  constructor() {
    super();
  }

  login() {
    return new Promise((resolve, reject) => {
      this.request.post(loginEndpoint, {
        form: {
          Email: email,
          Password: password
        }
      }, (err, res, body) => {
        if (err) {
          return reject(err);
        }

        resolve({message: 'yay'});
      });
    });
  };
}

module.exports = function() {
  return new Auth();
}
