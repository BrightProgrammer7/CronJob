# Cron Job for Fetching Multiple URLs

This repository contains a Node.js application that runs a scheduled cron job to fetch a list of specified URLs. It's designed for deployment on services like Render, Heroku, or any environment that supports Node.js.

The script is configured using environment variables to define the target URLs and the cron schedule.

## Key Features

* **Multiple URL Fetching**: Fetches a comma-separated list of URLs concurrently.
* **Scheduled Execution**: Automatically runs at intervals you define using a cron string.
* **Environment-Based Configuration**: Easily configure URLs and schedule using a `.env` file or platform-specific environment variables.
* **Robust Logging**: Provides clear, individual status logs for each URL on every run, with timestamps formatted for the "Asia/Kolkata" timezone.
* **Efficient & Resilient**: Uses `Promise.allSettled` to ensure that one failed URL request does not prevent others from being fetched.

---

## Setup and Usage

### 1. Prerequisites

* [Node.js](https://nodejs.org/) (LTS version recommended)
* [Git](https://git-scm.com/)

### 2. Clone the Repository

Clone this repository to your local machine:
```bash
git clone [https://github.com/your-username/your-repo.git](https://github.com/your-username/your-repo.git)
cd your-repo
```

### 3. Install Dependencies

Install the required npm packages:
```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the root of your project. This file will store your configuration.

```
# .env

# A comma-separated list of URLs that the cron job should fetch.
# IMPORTANT: Do not leave spaces between the commas and the URLs.
URLS_TO_FETCH=[https://api.yourservice.com/health,https://your-website.com,https://another-api-endpoint.net](https://api.yourservice.com/health,https://your-website.com,https://another-api-endpoint.net)

# The cron schedule for how often the job should run.
# Example: '*/15 * * * *' means "run every 15 minutes".
CRON_SCHEDULE='*/15 * * * *'

# (Optional) A URL to your own application. If provided, the job will
# also ping this URL. This is useful for keeping a free-tier service "awake".
FETCH_OWN=[https://your-cron-app-instance-url.com](https://your-cron-app-instance-url.com)

# (Optional) The port the server will run on. Defaults to 3002.
PORT=3002
```
**Tip**: For help creating a cron schedule string, you can use a tool like [crontab.guru](https://crontab.guru/).

### 5. Running the Application

To start the server locally, run:
```bash
npm run dev
```
Once started, the server will log the list of URLs it is monitoring and immediately schedule the cron job.

---

## How It Works

* **Initialization**: When `index.js` starts, it reads the `URLS_TO_FETCH` string from the environment variables and splits it into an array of URLs.
* **Scheduling**: It validates the `CRON_SCHEDULE` and schedules the `fetchUrlsJob` function to run accordingly. This happens only **once**.
* **Execution**: At each scheduled interval, `fetchUrlsJob` runs. It sends GET requests to all URLs in the list concurrently and logs the success or failure status for each one.
* **Server**: An Express server is started to keep the process alive (a requirement for many hosting services) and to provide a status endpoint.

## Deployment on Render

1.  Push your code to a GitHub repository.
2.  Create a new **Web Service** on Render and connect it to your repository.
3.  Set the **Start Command** to `npm run start`.
4.  Go to the **Environment** tab and add your environment variables (`URLS_TO_FETCH`, `CRON_SCHEDULE`, etc.).
5.  Deploy the service. Render will keep the service running, ensuring your cron job executes as scheduled.
