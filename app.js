'use strict';

let _ = require('lodash');
let assert = require('assert');
let express = require('express');
let through = require('through');
let urlUtil = require('url');
let basicAuth = require('basic-auth');
let app = module.exports = express();
let allowedApps = loadAllowedAppsFromEnv();
let net = require('net');

if (process.env.DEBUG) {
  console.log('Allowed apps', allowedApps);
}

app.use(function authenticate (req, res, next) {
  let auth = basicAuth(req) || {};
  let app = allowedApps[auth.name];
  if (app !== undefined && app.password === auth.pass) {
    next();
  } else {
    res.status(401).send('Unauthorized');
    if (process.env.DEBUG) {
      console.log('Unauthorized access by %s', auth.name);
    }
  }
});

app.post('/', function (req, res) {
  if(req.body !== undefined) {
    req.body.pipe(through(line => processLine(line)));
  }

  res.send('OK');
});

let port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Server listening on port ' + port);
});


/**
 * Matches a line against a rule and processes it
 * @param {object} line
 */
function processLine (line) {
  let client = new net.Socket();
  client.connect(10516, '127.0.0.1', function() {
      console.log(line);
      client.write(line);
      client.disconnect();
  });
}


/**
 * Construct allowed apps object from the environment vars containing
 * names, passwords and default tags for apps that may use the drain
 */
function loadAllowedAppsFromEnv () {
  assert(process.env.ALLOWED_APPS, 'Environment variable ALLOWED_APPS required');
  let appNames = process.env.ALLOWED_APPS.split(',');
  let apps = appNames.map(function (name) {
    // Password
    var passwordEnvName = name.toUpperCase() + '_PASSWORD';
    var password = process.env[passwordEnvName];
    assert(password, 'Environment variable ' + passwordEnvName + ' required');
    return [name, { password }];
  });

  return _.object(apps);
}
