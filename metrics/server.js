const express = require('express')
const Tail = require('tail').Tail

// Small and large particles per cubic foot
class IAQMetrics {
    constructor(large, small, lastReading) {
        this.large = large
        this.small = small
        this.lastReading = lastReading
    }

    timeSinceLastReading() {
        return Date.now() - this.lastReading
    }

    toPrometheusFormat() {
        return `iaq_monitor_reading_small ${this.small}\n` +
            `iaq_monitor_reading_large ${this.large}\n`
    }
}
IAQMetrics.createNow = (large, small) => new IAQMetrics(large, small, Date.now())

function metricsRoute(req, res) {
    res.set("Content-Type", "text/plain")

    try {
        if (!currentMetrics) throw `No metrics available`
        if (currentMetrics.timeSinceLastReading() > 120*1000) throw `Too much time has passed since the last reading: ${timeSinceLastReading}ms`
        
        res.send(currentMetrics.toPrometheusFormat())
    } catch (e) {
        res.status(503).send(`Error: ${e}`)
    }
}

function tryParseLogLine(line) {
    try {
        console.log(line)
    
        const lineParts = line.split(", ")
        const small = parseInt(lineParts[1])
        const large = parseInt(lineParts[2])

        if (small < 0 || small > 10000000) throw "Small reading out of range"
        if (large < 0 || large > 100000) throw "Large reading out of range"
        
        currentMetrics = IAQMetrics.createNow(large, small)
    } catch (e) {
        console.log(`Error parsing log: ${e}`)
    }
}

/////////////////////////////
// SCRIPT STARTS
/////////////////////////////

// Config
const port = 9091
const logFile = "C:\\Users\\joshk\\Documents\\Dylos Logs\\DylosLog.txt"

// Current reading levels
var currentMetrics = new IAQMetrics()

// Begin reading the logfile
new Tail(logFile, {
    fromBeginning: true,
    useWatchFile: true
}).on("line", tryParseLogLine)

// Serve a web process
const app = express()
app.get("/metrics", metricsRoute)
app.listen(port, () => console.log(`Listening on port ${port}!`))