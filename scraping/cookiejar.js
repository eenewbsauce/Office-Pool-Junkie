const request = require('request');

class CookieJar {
    constructor() {
        this.cookieJar = request.jar();
    }

    setCookie(cookie) {
        this.cookieJar.setCookie(request.cookie(cookie), 'https://www.officepooljunkie.com/login.php');
    }

    getCookie() {
        return this.cookieJar;
    }

    setRequestHeaders(headers) {
        this.requestHeaders = headers
    }

    getRequestHeaders(headers) {
        return this.requestHeaders;
    }
}

module.exports = new CookieJar();
