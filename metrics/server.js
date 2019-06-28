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

    // Estimate pm2.5 micrograms per cubic metre
    estimatePm25() {
        // Per http://www.aqmd.gov/docs/default-source/aq-spec/field-evaluations/dylos-dc1100---field-evaluation.pdf?sfvrsn=2
        // We can estimate PM2.5 ug/m³ from Dylos #/ft³ with this formula:
        // y = -8E-12x² + 5E-05x + 3.9773
        // R² = 0.8145 agreement with a GRIMM Model 180 (gold standard)

        const a = -8 * 10**-12 // -8E-12
        const b = 5 * 10**-5 // 5E-05
        const c = 3.9773

        const x = this.small
        const estimate = a*x**2 + b*x + c

        return Math.round(estimate * 10) / 10
    }

    toPrometheusFormat() {
        return `iaq_monitor_reading_small ${this.small}\n` +
            `iaq_monitor_reading_large ${this.large}\n` +
            `iaq_monitor_pm25 ${this.estimatePm25()}\n`
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
const logFile = process.argv[2] || "C:\\Users\\joshk\\Documents\\Dylos Logs\\DylosLog.txt"
const port = process.argv[3] || 9091

console.log(`Attempting to use logFile: ${logFile}`)
console.log(`Will bind to port ${port}`)

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