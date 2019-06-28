#!/bin/sh
PORT=${PORT:=80}
LOGFILE=${LOGFILE:=/data/dyloslog}
node /app/server.js "$LOGFILE" "$PORT"