#!/bin/sh

mkdir -p /app/.apt/etc/datadog-agent/conf.d/logging
cp logging-config.yml /app/.apt/etc/datadog-agent/conf.d/logging/config.yml
