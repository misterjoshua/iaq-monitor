# iaq-monitor
This is a project for my home to monitor and better manage my indoor air quality.

This project exists because I was [concerned about the accuracy of consumer-grade air quality monitors](http://explorables.cmucreatelab.org/explorables/air-quality-monitor-tests/)  such as the Air Quality Egg PM, Awair, Foobot, and Speck, despite their nice-have features.

The Dylos DC1100 Pro is [relatively affordable](http://www.dylosproducts.com/dcproairqumo.html) air quality sensor, has a serial data port, and [tracks well](http://www.aqmd.gov/docs/default-source/aq-spec/field-evaluations/dylos-dc1100---field-evaluation.pdf?sfvrsn=2) with the EPA-approved Grimm Model 180. Dylos units have a PC logging software, but it is prone to losing data due, can't track multiple units, has no alerting capabilities, and doesn't estimate mass concentration from particle counts.

Therefore, this project seeks to address these issues by integrating with a common time-series database, reporting software, and IoT infrastructure that collectively provide the missing features.

## Features
- Continuously monitors air quality
- Estimates PM2.5 mass concentration (ug/m3) from PM particle counts
- Provides reporting information to the Prometheus time series database
- Bundled Grafana to create dashboards

## Future Plans
- Read the serial port format directly
- Label Prometheus data with data identifying the sensor unit
- AWS IoT device integration (alternative to Prometheus + Grafana)
- AWS IoT CloudFormation templates (roll your own cloud)
- Raspberry Pi monitoring unit
- Documentation

## Overall System
At home, my setup includes the following:

- Dylos DC1100 Pro unit (with serial port)
- IOGEAR GBC232A Class 1 Bluetooth serial transmitter
- Generic Class 1 Bluetooth dongle on my desktop
- Dylos Logger software writing to a log file
- A Node.js script that tails the Dylos logger and provides an HTTP API in Prometheus reporting format
- Prometheus & Grafana in a docker-compose file

## Setup
I don't have much in the way of setup instructions because this project is too early in its development. However, roughly you need to connect to the DC1100 Pro, run the Dylos logger, start the node script, and use docker-compose to bring `prometheus/docker-compose.yml` up.
