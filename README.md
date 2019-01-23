# Heroku Datadog Drain

Funnel metrics from multiple Heroku apps into DataDog using statsd.

Supported Heroku metrics:
- Heroku Router response times, status codes, etc.
- Application errors
- Heroku Postgres metrics
- Heroku Dyno [runtime metrics](https://devcenter.heroku.com/articles/log-runtime-metrics)

# Get Started

If the organization does NOT already have an Heroku app set up for DataDog then proceed to
the [First Time](#first-time) section, otherwise [Add a new drain](#add-a-new-drain).

NOTE: In the example below both the capitalization and separators of the template var
`<your-app-slug>` are important!

## First Time

```bash
# Get the repo
git clone git@github.com:streetteam/heroku-datadog-drain.git

# Go into the repo directory
cd heroku-datadog-drain

# Create the Heroku instance
heroku create

# Set the initial Heroku instance config for you for app.
heroku config:set ALLOWED_APPS=<your_app_slug> <YOUR_APP_SLUG>_PASSWORD=<password> --app <this-log-drain-app-slug>

# Push this code to heroku master
git push heroku master

# Scale the heroku instance with resources.
heroku ps:scale web=1

# Add the drain
heroku drains:add https://<your_app_slug>:<password>@<this-log-drain-app-slug>.herokuapp.com/ --app <your-app-slug>
```

## Add a new drain

If you already have an heroku app for DataDog then you only need to run the
following commands to add a new drain:

```bash
# The ALLOWED_APPS var will already be configured in Heroku, so you will need to
# grab the value of this var first from Heroku and then append <your-app-slug> as another
# comma seperated value.
HEROKU_DRAIN_ALLOWED_APPS="$(heroku config:get ALLOWED_APPS --app <this-log-drain-app-slug>)"

# Check the output of the variable and confirm it is correct.
echo $HEROKU_DRAIN_ALLOWED_APPS

# The password should be a secure, randomly generated password.
# NOTE: You need to set the ALLOWED_APPS and <YOUR_APP_SLUG>_PASSWORD at the same
# time otherwise the collection for metrics of all other apps will STOP.
heroku config:set ALLOWED_APPS=$HEROKU_DRAIN_ALLOWED_APPS,<your_app_slug> <YOUR_APP_SLUG>_PASSWORD=<password> --app <this-log-drain-app-slug>

# Now you can add this drain using the crendentials set above.
heroku drains:add https://<your_app_slug>:<password>@<this-log-drain-app-slug>.herokuapp.com/ --app <your-app-slug>
```

## Configuration
```bash
ALLOWED_APPS=my-app,..    # Required. Comma seperated list of app names
<APP-NAME>_PASSWORD=..    # Required. One per allowed app where <APP-NAME> corresponds to an app name from ALLOWED_APPS
<APP-NAME>_TAGS=mytag,..  # Optional. Comma seperated list of default tags for each app
<APP-NAME>_PREFIX=yee     # Optional. String to be prepended to all metrics from a given app
STATSD_URL=..             # Optional. Default: statsd://localhost:8125
DEBUG=                    # Optional. If DEBUG is set, a lot of stuff will be logged :)
```
