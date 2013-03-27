var utils = require('../js/utils.js');
function MockResponse() {
    this.things_sent = undefined;
}

MockResponse.prototype.send = function(obj) {
    this.things_sent = obj;
}

function MockRequest(body) {
    this.body = body;
}

module.exports = utils.exportFunctions([MockRequest, MockResponse]);
