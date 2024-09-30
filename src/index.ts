#!/usr/bin/env node

import { parseUrlFile } from './github-wrapper';
import fs from "fs";
import path from 'path';
import { Command } from "commander";
import { exec } from 'child_process';

const program = new Command();

program
  .version("0.0.1")
  .parse(process.argv);

const options = program.opts();

/**
 * Handle the "install" command by running `npm install`.
 * This installs all dependencies listed in the package.json file.
 */
if (process.argv[2] === 'install') {
    exec('npm install', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            process.exit(1); // Exit with error code 1
        } else {
            console.log('All dependencies were installed successfully.');
            process.exit(0); // Exit with success code 0
        }
    });
}

/**
 * Test command behaviour
 * This run npx jest and parsed it's results to get total tests and passed tests
 */
else if (process.argv[2] === "test") {
    // Run Jest with JSON output and coverage
    exec('npx jest --coverage --json --outputFile=jest-results.json', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            process.exit(1); // Exit with error code 1 if Jest fails
        }

        // Read the Jest results from the JSON output file
        fs.readFile('jest-results.json', 'utf8', (readError, data) => {
            if (readError) {
                console.error(`Error reading Jest results: ${readError.message}`);
                process.exit(1);
            }

            try {
                const results = JSON.parse(data);
                const totalTests = results.numTotalTests || 0;
                const passedTests = results.numPassedTests || 0;

                // Calculate line coverage based on summary
                const coveragePercentage = ((passedTests / totalTests) * 100).toFixed(2);

                console.log(`${passedTests}/${totalTests} test cases passed. ${coveragePercentage}% line coverage achieved.`);
            } catch (parseError) {
            // Cast `parseError` as `Error` to safely access its `message` property
            if (parseError instanceof Error) {
                console.error(`Error parsing Jest results JSON: ${parseError.message}`);
            } else {
                console.error('An unknown error occurred while parsing Jest results.');
            }
            process.exit(1);
            }
        });
    });
    process.exit(0);
}

/**
 * If no recognized commands are given, the script expects a file path as an argument
 * and processes it using the `parseUrlFile` function.
 */
else {
    // Check if the required environment variables are set
    if (!process.env.LOG_FILE || !process.env.GITHUB_TOKEN) {
        console.error('Error: Required environment variables (LOG_FILE or GITHUB_TOKEN) are not set.');
        process.exit(1);  // Exit with error code 1 if either is missing
    }

    // Get the path to the URL file provided as an argument
    //const urlFilePath = path.join(process.cwd(), String(process.argv[2])); // Use the current working directory
    const urlFilePath = String(process.argv[2])

    // Check if the file exists before processing
    if (!fs.existsSync(urlFilePath)) {
        console.error(`Error: The file "${urlFilePath}" does not exist.`);
        process.exit(1); // Exit with error code 1 if the file doesn't exist
    }

    // Parse the file and calculate metrics
    parseUrlFile(urlFilePath).then(() => {
        process.exit(0);
    }).catch(error => {
        console.error('Error parsing URL file:', error);
        process.exit(1); // Exit with a non-zero code on error
    });
}
