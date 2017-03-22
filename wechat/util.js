const xml2js = require('xml2js');

function parseXMLAsync(xml) {
    return new Promise((resolve, reject) => {

        // https://www.npmjs.com/package/xml2js
        xml2js.parseString(xml, {trim: true}, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

function formatMessage(result) {
    var message = {};
    if (typeof result === 'object') {

        var keys = Object.keys(result);
        for (var i = 0; i < keys.length; i++) {
            var item = result[keys[i]];
            var key = keys[i];

            if (!(item instanceof Array) || item.length === 0) {
                continue;
            }

            if (item.length === 1) {
                var val = item[0];

                if (typeof val === 'object') {
                    message[key] = formatMessage(val);
                } else {
                    message[key] = (val || '').trim();
                }
            } else {
                message[key] = [];
                for (var j = 0, k = item.length; j < k; j++) {
                    message[key].push(formatMessage(item[j]));
                }
            }
        }
    }

    return message;
}

/**
 * public API
 */
exports.parseXMLAsync = parseXMLAsync;
exports.formatMessage = formatMessage;