// Load environment variables from a .env file
require('dotenv').config();

// Import necessary modules
const express = require('express');
const axios = require('axios');
const cron = require('node-cron');
const morgan = require('morgan');
// Import the custom date formatter
const { formatDate } = require('./formatDate.js');


// --- Application Setup ---
const app = express();
const PORT = process.env.PORT || 3002;

// --- Environment Variable Validation ---
// Now accepts a comma-separated string of URLs
const { URLS_TO_FETCH, CRON_SCHEDULE, FETCH_OWN } = process.env;

if (!URLS_TO_FETCH || !CRON_SCHEDULE) {
    console.error("Error: Missing required environment variables (URLS_TO_FETCH, CRON_SCHEDULE).");
    console.log("Please ensure your .env file contains these variables.");
    process.exit(1); // Exit the process if critical variables are missing
}

// Split the comma-separated string into an array of URLs
const urls = URLS_TO_FETCH.split(',').map(url => url.trim());

// --- Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // Logging HTTP requests

// --- Cron Job Logic ---
/**
 * Asynchronously fetches all defined URLs and logs their outcomes.
 */
async function fetchUrlsJob() {
    const timeNow = formatDate(new Date());
    console.log(`[${timeNow}] --- Cron job starting for ${urls.length} URL(s) ---`);
    console.time('Total Fetch Duration');

    // Create an array of fetch promises
    const fetchPromises = urls.map(url => axios.get(url));

    // Use Promise.allSettled to wait for all fetches to complete, regardless of success or failure
    const results = await Promise.allSettled(fetchPromises);

    results.forEach((result, index) => {
        const url = urls[index];
        if (result.status === 'fulfilled') {
            const { status, statusText } = result.value;
            console.log(`✅ SUCCESS fetching ${url} | Status: [${status}, ${statusText}]`);
        } else {
            // Handle axios errors
            const error = result.reason;
            if (error.response) {
                console.error(`❌ FAILED fetching ${url} | Status: [${error.response.status}, ${error.response.statusText}]`);
            } else if (error.request) {
                console.error(`❌ FAILED fetching ${url} | Error: No response received from server.`);
            } else {
                console.error(`❌ FAILED fetching ${url} | Error: ${error.message}`);
            }
        }
    });

    // Optionally, fetch its own URL if defined
    if (FETCH_OWN) {
        try {
            console.log(`Pinging own URL: ${FETCH_OWN}`);
            await axios.get(FETCH_OWN);
            console.log('✅ SUCCESS pinging own URL.');
        } catch(error) {
            console.error(`❌ FAILED pinging own URL: ${FETCH_OWN}`);
        }
    }

    console.timeEnd('Total Fetch Duration');
    console.log(`--- Cron job finished ---`);
}

// --- Cron Job Scheduling ---
if (cron.validate(CRON_SCHEDULE)) {
    console.log(`Scheduling cron job with schedule: "${CRON_SCHEDULE}"`);
    cron.schedule(CRON_SCHEDULE, fetchUrlsJob, {
        scheduled: true,
        timezone: "Etc/UTC"
    });
} else {
    console.error(`Error: Invalid CRON_SCHEDULE format: "${CRON_SCHEDULE}".`);
    process.exit(1);
}


// --- API Routes ---
app.get('/', (req, res) => {
    res.status(200).send(`<h2>✅ Cron job server is running correctly.</h2><p>Scheduled to fetch ${urls.length} URL(s).</p>`);
});

app.get('/run-manually', async (req, res) => {
    console.log("Manual trigger of fetch job requested.");
    await fetchUrlsJob();
    res.send('Manual fetch job executed. Check server logs for details.');
});


// --- Server Start ---
app.listen(PORT, () => {
    console.log(`\n🚀 Server listening on port ${PORT}`);
    console.log(`Monitoring the following URLs:\n- ${urls.join('\n- ')}`);
});
