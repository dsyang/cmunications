var utils = require('../js/utils.js');
function MockResponse() {
    this.sent = false;
    this.things_sent = undefined;
}

MockResponse.prototype.send = function(obj) {
    if(this.sent === false) {
        this.things_sent = obj;
        this.sent = true;
    }
}

function MockRequest(body) {
    this.body = body;
}

module.exports = utils.exportFunctions([MockRequest, MockResponse]);
