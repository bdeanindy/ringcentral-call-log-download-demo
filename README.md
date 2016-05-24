# RingCentral Call Log Download Demo App

This is a demo application showing how to use RingCentral API Call Log resource via the JS SDK to download call logs for your account. This application will GET all the n your RingCentral account (based on the environment, but defaults to Sandbox) and will convert the call log JSON data (once all data is fetched) into a .csv file and save locally. 

This is only a demo application to show how to use Call Logs API resource  properly with the [RingCentral-JS](https://github.com/ringcentral/ringcentral-js) SDK. This code should not be used directly in production, but can be used for PoC development and testing.

## Prerequisites

* Valid RingCentral Account
* Access to [RingCentral Developer Portal](https://developer.ringcentral.com)
* Have created a RingCentral Sandbox Account for development. [Read how to do this here](https://developers.ringcentral.com/library/tutorials/test-account.html)
* Have configured your Sandbox Account to have one or more extensions which allow presence to be monitored. [Read how to setup Presence monitoring here](http://success.ringcentral.com/articles/en_US/RC_Knowledge_Article/How-to-choose-specific-user-extensions-to-monitor-for-Presence)
* Node.js installed locally

## Setup

1. Clone `git clone https://github.com/bdeanindy/ringcentral-call-log-download-demo.git` this repository and `cd ringcentral-call-log-download-demo` into the project directory
2. Install the dependencies `npm install`
3. Configure your environment `cp .env.tmpl .env`
4. Create an application in [RingCentral Developer Portal](https://developers.ringcentral.com/my-account.html#/create-app) with the following parameters:
    * Platform Type: Server-only (No UI)
    * Application Type: Private
    * Permissions Needed: Read Accounts, Read Call Log
    * Name/Description: What you choose, but I always use something easy to identify in lists
5. Populate your environment file with your Application and Admin user data (the keys in the `.env` file should be pretty straight forward)


## Operation

1. To start the application, `npm start`
2. When you see "The file: myRingCentralCallLogs---{{timestamp}}.csv has been written", the application is complete and you should see a new file in the root of this project directory named as today's date and containing your call log data.

## Troubleshooting

1. Not seeing your CSV? Inspect the paging property of the request and see if you have more than 10K call logs (this can cause your application to be throttled)
3. Anything else...add an issue and I will respond as soon as I am able
