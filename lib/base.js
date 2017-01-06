const requestLib          = require('request');
const requestInstance     = requestLib.defaults({ jar: true });

class Base {
  constructor() {
      this.request = requestInstance;
  }
}

module.exports = Base;
