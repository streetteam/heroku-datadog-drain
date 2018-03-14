mkdir -p /app/.apt/etc/datadog-agent/conf.d/logging.d
node ./bin/generate-logging-config.js > logging-config.yml
cp logging-config.yml /app/.apt/etc/datadog-agent/conf.d/logging.d/config.yml
# Reload datadog configs
pkill -USR2 -f datadog
