// Load environment variables from a .env file
require('dotenv').config();

// Import necessary modules
const express = require('express');
const axios = require('axios');
const cron = require('node-cron');
const morgan = require('morgan');
// Import the custom date formatter
// This requires 'moment-timezone' to be installed (npm install moment-timezone)
const { formatDate } = require('./formatDate.js');


// --- Application Setup ---
const app = express();
const PORT = process.env.PORT || 3002;

// --- Environment Variable Validation ---
const { URL_TO_FETCH, CRON_SCHEDULE, FETCH_OWN } = process.env;

if (!URL_TO_FETCH || !CRON_SCHEDULE) {
    console.error("Error: Missing required environment variables (URL_TO_FETCH, CRON_SCHEDULE).");
    console.log("Please ensure your .env file contains these variables.");
    process.exit(1); // Exit the process if critical variables are missing
}

// --- Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // Logging HTTP requests

// --- Cron Job Logic ---
/**
 * Asynchronously fetches the defined URL and logs the outcome.
 */
async function fetchUrlJob() {
    // Now uses the imported formatDate function
    const timeNow = formatDate(new Date());
    console.log(`[${timeNow}] --- Cron job starting ---`);
    console.time('API Fetch Duration');

    try {
        console.log(`Fetching primary URL: ${URL_TO_FETCH}`);
        const { status, statusText } = await axios.get(URL_TO_FETCH);
        console.log('Primary URL fetch successful.');
        console.log('API Status:', { Status: [status, statusText] });

        // Optionally, fetch its own URL if defined
        if (FETCH_OWN) {
            console.log(`Fetching own URL: ${FETCH_OWN}`);
            await axios.get(FETCH_OWN);
            console.log('Own URL fetch successful.');
        }

    } catch (error) {
        console.error(`Error fetching URL: ${URL_TO_FETCH}`);
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Error Status:', {
                Status: [error.response.status, error.response.statusText]
            });
        } else if (error.request) {
            // The request was made but no response was received
            console.error('Error Request: No response received from the server.');
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error Message:', error.message);
        }
    } finally {
        console.timeEnd('API Fetch Duration');
        console.log(`--- Cron job finished ---`);
    }
}

// --- Cron Job Scheduling ---
// Validate the cron schedule format to prevent runtime errors
if (cron.validate(CRON_SCHEDULE)) {
    console.log(`Scheduling cron job with schedule: "${CRON_SCHEDULE}"`);
    cron.schedule(CRON_SCHEDULE, fetchUrlJob, {
        scheduled: true,
        timezone: "Etc/UTC" // Cron timezone is UTC, but logging will be formatted to Indian time
    });
} else {
    console.error(`Error: Invalid CRON_SCHEDULE format: "${CRON_SCHEDULE}".`);
    console.error("Please provide a valid cron string (e.g., '*/5 * * * *').");
    process.exit(1);
}


// --- API Routes ---
app.get('/', (req, res) => {
    res.status(200).send(`<h2>✅ Cron job server is running correctly.</h2><p>The job is scheduled and will run automatically. No need to visit any other endpoint.</p>`);
});

// A simple endpoint to manually trigger the job if needed for testing
app.get('/run-manually', async (req, res) => {
    console.log("Manual trigger of fetch job requested.");
    await fetchUrlJob();
    res.send('Manual fetch job executed. Check server logs for details.');
});


// --- Server Start ---
app.listen(PORT, () => {
    console.log(`\n🚀 Server listening on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to check server status.`);
});
