#!/bin/sh

mkdir -p /app/.apt/etc/datadog-agent/conf.d/logging.d
cp logging-config.yml /app/.apt/etc/datadog-agent/conf.d/logging.d/config.yml
