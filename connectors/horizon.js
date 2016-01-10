console.log('horizon connector loading...');

///////////////////////////////////////////
// REQUIRES
// Request (for HTTP calls) and cheerio for 
// converting querying HTML.
///////////////////////////////////////////
var cheerio = require('cheerio'),
    request = require('request');

///////////////////////////////////////////
// VARIABLES
///////////////////////////////////////////
var catUrl = 'ipac20/ipac.jsp?menu=search&index=ISBNEX&term=';

//////////////////////////
// Function: searchByISBN
//////////////////////////
exports.searchByISBN = function (isbn, lib, callback) {
    var responseHoldings = { service: lib.Name, availability: [], start: new Date() };
    var handleError = function (error) {
        responseHoldings.error = error;
        responseHoldings.end = new Date();
        callback(responseHoldings);
        return true;
    };

    // Request 1: Use the item deep link URL
    request.get({ url: lib.Url + catUrl + isbn, timeout: 20000 }, function (error, msg, response) {
        if (handleError(error)) return;
        var libs = {};
        $('table.bibItems tr.bibItemsEntry').each(function (index, elem) {
            var name = $(this).find('td').eq(0).text().trim();
            var status = $(this).find('td').eq(2).text().trim();
            if (!libs[name]) libs[name] = { available: 0, unavailable: 0 };
            status == 'AVAILABLE' ? libs[name].available++ : libs[name].unavailable++;
        });
        for (var l in libs) responseHoldings.availability.push({ library: l, available: libs[l].available, unavailable: libs[l].unavailable });
        responseHoldings.end = new Date();
        callback(responseHoldings);
    });
};