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
let bodyParser = require('body-parser');
let yaml = require('js-yaml');
let fs = require('fs');

let loggingConfigPath = '/app/.apt/etc/datadog-agent/conf.d/logging.d/config.yml';
let loggingConfig = yaml.safeLoad(fs.readFileSync(loggingConfigPath, 'utf8'));
let ports = {};
loggingConfig.logs.forEach(function(item, index, arr) {
     ports[item.service.replace('-', '_')] = item.port;
});

if (process.env.DEBUG) {
  console.log('Allowed apps', allowedApps);
}

app.use(bodyParser.text({'type': function() { return true; }}));
app.use(function authenticate (req, res, next) {
  let auth = basicAuth(req) || {};
  let app = allowedApps[auth.name];
  if (app !== undefined && app.password === auth.pass) {
    req.appName = auth.name;
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
    req.body.split('\n').forEach(function(line, index, arr) {
      let client = new net.Socket();
      client.connect(ports[req.appName], '127.0.0.1', function() {
        client.write((line.split(/>1 /)[1] || line) + '\n', 'binary', function() {
          client.end();
        });
      });
    });
  }

  res.send('OK');
});

let port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Server listening on port ' + port);
});


/**
 * Construct allowed apps object from the environment vars containing
 * names, passwords and default tags for apps that may use the drain
 */
function loadAllowedAppsFromEnv () {
  assert(process.env.ALLOWED_APPS, 'Environment variable ALLOWED_APPS required');
  let appNames = process.env.ALLOWED_APPS.split(',').map(function(name, index, arr) {
      return name.trim();
  });
  let apps = appNames.map(function (name) {
    // Password
    var passwordEnvName = name.trim().toUpperCase() + '_PASSWORD';
    var password = process.env[passwordEnvName];
    assert(password, 'Environment variable ' + passwordEnvName + ' required');
    return [name, { password }];
  });

  return _.object(apps);
}
