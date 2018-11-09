const loginEndpoint = 'https://www.officepooljunkie.com/login.php';
const email = process.env.OFFICE_POOL_JUNKIE_EMAIL;
const password = process.env.OFFICE_POOL_JUNKIE_PASSWORD;
const request = require('request');

const cookieJar = require('./cookiejar');

class Auth {
    login() {
        console.log('logging in');
        return new Promise((resolve, reject) => {
            cookieJar.setCookie('PHPSESSID=4q0f77fn1bje9n1mt8eagv02j6');
            return resolve({message: 'logged in!'});

            request({
                url: loginEndpoint,
                method: 'POST',
                form: {
                    email,
                    password
                }
            }, (err, res, body) => {
                if (err) {
                    return reject(err);
                }

                let cookie = res.headers['set-cookie'][0].split(';')[0];

                console.log(res.headers['set-cookie'])
                console.log(cookie)

                cookieJar.setCookie(cookie);

                resolve({message: 'logged in!'});
            });
        });
    };
}

module.exports = function () {
    return new Auth();
};
