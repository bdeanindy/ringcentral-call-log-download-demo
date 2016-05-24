'use strict';

// Deps
require('dotenv').config(); // If using this in multi-environment (local and deployed versions) might want to add logic for checking NODE_ENV environment variable to load only if local
var RC = require('ringcentral');
var Helpers = require('ringcentral-helpers');
var fs = require('fs');
var http = require('http');
var json2csv = require('json2csv');

// Initialize the RC SDK
var sdk = new RC({
    server: process.env.RC_API_BASE_URL,
    appKey: process.env.RC_APP_KEY,
    appSecret: process.env.RC_APP_SECRET,
    cachePrefix: process.env.RC_CACHE_PREFIX
});

// APP VARS
var server = http.createServer();
var platform = sdk.platform();

// Login to the RingCentral Platform
function login() {
    return platform.login({
            username: process.env.RC_USERNAME,
            password: process.env.RC_PASSWORD,
            extension: process.env.RC_EXTENSION
        })
        .then(function (response) {
            console.log("Succesfully logged into the RC Account");
            //console.log("The RC auth object is :", JSON.stringify(response.json(), null, 2));
            init();
        })
        .catch(function (e) {
            console.error("ERROR: ", e);
            throw e;
        });
}

login();

function init() {
    var callLogs = [];
    var page = 1;

    // Since Call Log falls into the "Heavy" Usage Plan for Basic applications
    // this will receive an HTTP 429 error if it exceeds 10 requests in 60 seconds
    // TODO: Add improvement to handle this situation properly
    function getCallLogsPage() {
        return platform
            .get('/account/~/call-log', {
                page: page,
                perPage: process.env.LOGS_PER_PAGE, // MAX is 1000
                dateFrom: process.env.DATE_FROM,
                dateTo: process.env.DATE_TO,
                view: process.env.VIEW
            })
            .then(function (response) {
                console.log("The call logs response contained:", JSON.stringify(response.json(), null, 2));
                var data = response.json();
                console.log("************** THE NUMBER OF CALL LOGS THIS REQUEST CYCLE ARE : ***************", data.records.length);
                callLogs = callLogs.concat(data.records);
                if (data.navigation.nextPage) {
                    page++;
                    return getCallLogsPage(); // this will be chained
                } else {
                    return callLogs; // this is the finally resolved thing
                }
            });
    }

    /*
     Loop until you capture all extensions
     */
    return getCallLogsPage()
        .then(convertToCSV)
        .then(function(csvString) {
            writeCSV(csvString);
        })
        .catch(function (e) {
            console.error(e);
            throw e;
        });

}

function convertToCSV(callLogs) {
    console.log("********* CONVERTING TO CSV ***************");
    return new Promise(function(resolve, reject) {
        // Need to use the right headers depending upon the view
        json2csv({ data: callLogs}, function(err, csv) {
            if(err) {
                console.error(err);
                reject(err);
            } else {
                console.log( 'CSV DATA FROM JSON2CSV');
                console.log(csv);
                resolve(csv);
            }
        });
    });
}

function writeCSV(csvData) {
    console.log("********* WRITING CSV ***************");
    return new Promise(function(resolve, reject) {
        console.log(csvData);
        var nowStr = +new Date(); // Seconds since Epoch (Unix timestamp)
        var filename = process.env.OUTPUT_FILE_PREFIX + '--' + nowStr + '.csv';

        // Write the file to disc
        fs.writeFile('./' + filename, csvData, function(err, data) {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                console.log('The file: ' + filename + ' has been written');
                resolve(data);
            }
        });
    });
}

// Register Platform Event Listeners
platform.on(platform.events.loginSuccess, handleLoginSuccess);
platform.on(platform.events.loginError, handleLoginError);
platform.on(platform.events.logoutSuccess, handleLogoutSuccess);
platform.on(platform.events.logoutError, handleLogoutError);
platform.on(platform.events.refreshSuccess, handleRefreshSuccess);
platform.on(platform.events.refreshError, handleRefreshError);

/**
 * Platform Event Handlers
 **/
function handleLoginSuccess(data) {
    // UNCOMMENT TO VIEW LOGIN DATA
    console.log('LOGIN SUCCESS DATA: ', data.json());
}

function handleLoginError(data) {
    console.log('LOGIN FAILURE DATA: ', data);
}

function handleLogoutSuccess(data) {
    console.log('LOGOUT SUCCESS DATA: ', data);
}

function handleLogoutError(data) {
    console.log('LOGOUT FAILURE DATA: ', data);
}

function handleRefreshSuccess(data) {
    console.log('REFRESH SUCCESS DATA: ', data);
}

function handleRefreshError(data) {
    console.log('REFRESH FAILURE DATA: ', data);
    console.log('Initialing Login again :');
    login();
}

server.listen(process.env.PORT);
server.on('listening', function() {
    console.log('Server is listening on port: ', process.env.PORT);
});
server.on('close', function() {
    console.log('Server has closed and is no longer accepting connections');
});
server.on('error', function(err) {
    console.error(err);
});
server.on('request', inboundRequest);

function inboundRequest(req, res) {
    console.log('Inbound Request');
}
