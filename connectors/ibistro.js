console.log('ibistro connector loading...');

///////////////////////////////////////////
// REQUIRES
// Request (for HTTP calls) and cheerio for
// querying the HTML returned.
///////////////////////////////////////////
var request = require('request'),
    cheerio = require('cheerio');

///////////////////////////////////////////
// VARIABLES
///////////////////////////////////////////
var searchUrl = '?searchdata1=';

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

    // Declare this for use later on depending on search results.
    var getAvailability = function (itemPage) {
        $ = cheerio.load(itemPage);
        var libs = {};
        var currentLib = '';
        $('tr').each(function (index, elem) {
            var libr = $(this).find('td.holdingsheader,th.holdingsheader').eq(0).text().trim();
            if (libr == 'Copies') libr = $(this).find('.holdingsheader_users_library').eq(0).text().trim();

            var status = $(this).find('td').eq(3).text().trim();
            if (libr) {
                currentLib = libr;
            } else {
                if (currentLib && status) {
                    if (!libs[currentLib]) libs[currentLib] = { available: 0, unavailable: 0 };
                    lib.Available.indexOf(status) > -1 ? libs[currentLib].available++ : libs[currentLib].unavailable++;
                }
            }
        });
        for (var l in libs) responseHoldings.availability.push({ library: l, available: libs[l].available, unavailable: libs[l].unavailable });
        responseHoldings.end = new Date();
        callback(responseHoldings);
    };

    // Request 1: 
    request.get({ url: lib.Url + searchUrl + isbn, timeout: 20000 }, function (error, msg, response) {
        if (handleError(error)) return;
        $ = cheerio.load(response);
        // Could be multiple copies held - check for a hitlist form
        if ($('form[name=hitlist]').length > 0) {
            // By default we'll get the first item - will probably extend this to loop through and get them all.
            // Request 2: 
            request.post({ url: msg.request.uri.protocol + '//' + msg.request.uri.host + $('#hitlist').attr('action'), body: "first_hit=1&form_type=&last_hit=2&VIEW%5E1=Details", timeout: 20000 }, function (error, message, response) {
                if (handleError(error)) return;
                getAvailability(response);
            });
        } else {
            getAvailability(response);
        }
    });
};