# **GitHub & NPM Metrics Analyzer**

## Purpose
This analyzer is a CLI tool designed to analyze GitHub and NPM repositories and calculate important metrics that reflect the repository's health and maintainability. Specifically, it calculates:

  - **Bus Factor**: A score indicating the distribution of contributions among maintainers. Higher scores indicate more contributors are required to reach a significant percentage of total contributions, improving project stability.
  - **Correctness**: Evaluate how well the project adheres to coding standards, documentation, and testing practices.
  - **Ramp-Up**: Measures how easy it is to understand and contribute to the project based on documentation quality and the number of open issues.
  - **Responsive Maintainer**: A measure of how quickly maintainers respond to issues and pull requests, indicating active maintenance.
  - **License**: Checks the type of license associated with the repository to ensure proper usage and contribution.
  - **NetScore**: A composite score calculated based on the other metrics, providing an overall evaluation of the project's health.

## Installation and Setup

### **1. Install Dependencies**
To set up the project, all necessary dependencies can be installed using the following command:

**run install**

### **2. GitHub Token Configuration**
To access GitHub's API, you need a personal access token. Save your access token as an environment variable named **GITHUB_TOKEN**

## Usage and Invoking the CLI
You can invoke the CLI tool using the **run** command in different modes:

### **1. Testing Mode**
To run the test suite and verify that all metrics are calculated correctly, use:
**run test**
If successful, this command will execute the test cases and print the following output: **X/Y test cases passed. Z% line coverage achieved.** Where X is the number of test cases passed, Y is the total number of test cases, and z% is the percentage of the code covered by tests.

### **2. Analyzing a repository**
To analyze a repository, provide a text file with a list of GitHub URLs and use the following command:
**run <URL_FILE>**
This command will produce a .NDJSON file containing a JSON-formatted analysis for each URL. The format of the output for each repository is as follows:
{"URL":"https://github.com/nullivex/nodist",
"NetScore":0.9,
"NetScore_Latency":0.9,
"RampUp":0.5,
"RampUp_Latency":0.5,
"Correctness":0.7,
"Correctness_Latency":0.7,
"BusFactor":0.3,
"BusFactor_Latency":0.3,
"ResponsiveMaintainer":0.4,
"ResponsiveMaintainer_Latency":0.4,
"License":1,
"License_Latency":1}

## Example of Valid Input and Output
**Input File (urls.txt):**
https://github.com/facebook/react
https://github.com/nodejs/node

**Command**
run urls.txt

**Output File (urls.txt.NDJSON)**
{"URL":"https://github.com/facebook/react",
"NetScore":0.85,
"NetScore_Latency":250,
"RampUp":0.9,
"RampUp_Latency":200,
"Correctness":0.88,
"Correctness_Latency":170,
"BusFactor":0.8,
"BusFactor_Latency":180,
"ResponsiveMaintainer":0.92,
"ResponsiveMaintainer_Latency":160,
"License":1,
"License_Latency":120}

{"URL":"https://github.com/nodejs/node",
"NetScore":0.83,
"NetScore_Latency":240,
"RampUp":0.88,
"RampUp_Latency":210,
"Correctness":0.85,
"Correctness_Latency":165,
"BusFactor":0.78,
"BusFactor_Latency":175,
"ResponsiveMaintainer":0.91,
"ResponsiveMaintainer_Latency":150,
"License":1,
"License_Latency":110}
