Cron Job for Fetching a Custom URLThis repository contains a Node.js application that runs a scheduled cron job to fetch a specified URL. It's designed for deployment on services like Render, Heroku, or any environment that supports Node.js.The script is configured using environment variables to define the target URL and the schedule for the cron job.Key FeaturesScheduled Fetching: Automatically fetches a URL at intervals you define.Environment-Based Configuration: Easily configure the URL and schedule using a .env file or platform-specific environment variables.Robust Logging: Provides clear logs for each job execution, including timestamps, status, and duration.Error Handling: Gracefully handles and logs network or HTTP errors.Single Job Instance: Ensures only one cron job schedule is running for the lifetime of the application instance.Setup and Usage1. PrerequisitesNode.js (LTS version recommended)Git2. Clone the RepositoryClone this repository to your local machine:git clone https://github.com/your-username/your-repo.git
cd your-repo
3. Install DependenciesInstall the required npm packages:npm install
4. Configure Environment VariablesCreate a .env file in the root of your project. This file will store your configuration.# .env

# The full URL that the cron job should fetch.
URL_TO_FETCH=https://your-target-api-or-website.com

# The cron schedule for how often the job should run.
# The format is: "minute hour day-of-month month day-of-week"
# Example: '*/15 * * * *' means "run every 15 minutes".
CRON_SCHEDULE='*/15 * * * *'

# (Optional) A URL to your own application. If provided, the job will
# also ping this URL. This is useful for keeping a free-tier service "awake".
FETCH_OWN=https://your-cron-app-instance-url.com

# (Optional) The port the server will run on. Defaults to 3002.
PORT=3002
Important: For help creating a cron schedule string, you can use a tool like crontab.guru.5. Running the ApplicationTo start the server locally, run:npm start
ornode app.js
Once started, the server will immediately schedule the cron job according to your CRON_SCHEDULE. You will see a confirmation message in the console.How It WorksInitialization: When the app.js script is executed, it reads the environment variables from the .env file.Scheduling: It validates the CRON_SCHEDULE and schedules the fetchUrlJob function to run accordingly. This happens only once when the server starts.Execution: At each scheduled interval, the fetchUrlJob function is executed. It sends a GET request to the URL_TO_FETCH and logs the outcome (success or error) to the console.Server: An Express server is also started to keep the process alive (which is necessary for services like Render) and to provide a status endpoint. Visiting the root URL (/) will confirm that the server is running.Deployment on RenderPush your code to a GitHub repository.Create a new Web Service on Render and connect it to your repository.Set the Start Command to npm start or node app.js.Go to the Environment tab and add the necessary environment variables (URL_TO_FETCH, CRON_SCHEDULE, etc.) instead of using a .env file.Deploy the service. Render will keep the service running, ensuring your cron job executes as scheduled.