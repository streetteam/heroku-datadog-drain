#!/bin/sh

APP_DIR=`cd $(dirname $0); cd ..; pwd`

mkdir -p /app/.apt/etc/datadog-agent/conf.d/logging
cp $APP_DIR/logging-config.yml /app/.apt/etc/datadog-agent/conf.d/logging/config.yml
