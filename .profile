mkdir -p /app/.apt/etc/datadog-agent/conf.d/logging.d
node ./bin/generate-logging-config.js > logging-config.yml
cp logging-config.yml /app/.apt/etc/datadog-agent/conf.d/logging.d/config.yml
echo 'Reloading datadog-agent with logging config'
pkill -f datadog
sleep 5
.profile.d/datadog.sh &
