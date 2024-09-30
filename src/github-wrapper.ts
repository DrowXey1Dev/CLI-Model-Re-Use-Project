import { functionTimer } from './function-timer';
import { calculateCorrectness } from './find-correctness';
import { calculateResponsiveMaintener } from './find-responsive-maintainer';
import { calculateBusFactor } from './bus-factor';
import { calculateRampUp } from './ramp-up';
import { calculateNetScore } from './netscore';
import { getGithubLink } from './Util/npmUtil';

import * as Util from './Util';
import * as API from './api-calls/github-adapter';

import fetch from 'node-fetch';

import fs from 'fs';

if (!Util.Constants.GITHUB_TOKEN) {
  Util.Logger.logErrorAndExit('Error: GITHUB_TOKEN is not set in the environment.');
}

/**
 * Parse a GitHub repository URL to extract the owner and repository name.
 * 
 * @param url - GitHub repository URL.
 * @returns An object containing the owner and repository name, or null if the URL is invalid.
 */
function parseGithubUrl(url: string): { owner: string, repo: string } | null {
  const match = url.match(/https:\/\/github\.com\/([^/]+)\/([^/]+)/);
  if (match && match[1] && match[2]) {
    return { owner: match[1], repo: match[2] };
  }
  return null;
}

/**
 * Calculate metrics for a given GitHub or npm package URL and return the result as a formatted string.
 * 
 * @param url - The URL of the GitHub repository or npm package.
 * @returns A formatted string containing the calculated metrics or an error message.
 */
export async function calculateMetricsForRepo(url: string): Promise<string> {
  // Parse the owner and repo from the URL
  const githubUrl = getGithubLink(url);
  const repoInfo = parseGithubUrl(await githubUrl);

  if (!repoInfo) {
    return `Invalid URL: ${githubUrl}`;
  }

  const { owner, repo } = repoInfo;

  try {
    // Fetch contributors for Bus Factor calculation
    const contributors = await API.fetchContributors(owner, repo);
    // Calculate Bus Factor
    const busFactor = await functionTimer(() => calculateBusFactor(contributors, 50));
    
    // Calculate Ramp-Up score
    const rampUpScore = await functionTimer(() => calculateRampUp(owner, repo));

    // Fetch license information
    const retrievedLicense = await functionTimer(() => fetchRepoLicense(owner, repo));
    
    // Calculate correctness
    const correctness = await functionTimer(() => calculateCorrectness(owner, repo));

    // Calculate Responsiveness
    const maintainResponsiveness = await functionTimer(() => calculateResponsiveMaintener(owner, repo));

    // Calculate NetScore
    const netScore = await functionTimer(() => calculateNetScore(
          busFactor.output,
          rampUpScore.output,
          correctness.output,
          maintainResponsiveness.output
     ));

    const result = `{"URL": "${url}", "NetScore": "${Number(netScore.output.toPrecision(5))}", "NetScore_Latency": ${Number(netScore.time.toPrecision(5))}, "RampUp": ${Number(rampUpScore.output.toPrecision(5))}, "RampUp_Latency": ${Number(rampUpScore.time.toPrecision(5))}, "Correctness": ${Number(correctness.output.toPrecision(5))}, "Correctness_Latency": ${Number(correctness.time.toPrecision(5))}, "BusFactor": ${Number(busFactor.output.toPrecision(5))}, "BusFactor_Latency": ${Number(busFactor.time.toPrecision(5))}, "ResponsiveMaintainer": ${Number(maintainResponsiveness.output.toPrecision(5))}, "ResponsiveMaintainer_Latency": ${Number(maintainResponsiveness.time.toPrecision(5))}, "License": "${Number(retrievedLicense.output)}", "License_Latency": ${Number(retrievedLicense.time.toPrecision(5))}}`;

    return result;
  } catch (error) {
    return `Error calculating Metrics for ${owner}/${repo}: ${error}`;
  }
}

/**
 * Fetch the license information from a GitHub repository.
 * 
 * @param owner - The repository owner (either username or organization).
 * @param repo - The name of the repository.
 * @returns The license information as a string.
 * @throws Will throw an error if the license cannot be retrieved.
 */
async function fetchRepoLicense(owner: string, repo: string) {
  try {
    const response = await fetch(`${Util.Constants.GITHUB_API_BASE_URL}/repos/${owner}/${repo}/license`, {
      headers: {
        Authorization: `token ${Util.Constants.GITHUB_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    
    // Check to see if the license is compatible or not
    if (String(data.license.name) !== 'Other') {
      // If the license is NOT equal to "Other", then it is compatible and return 1
      return 1;
    } else {
      // If the license is equal to "Other", return 0, since the license is not compatible
      return 0;
    }
  } catch (error) {
    console.error(`ERROR! Failed to retrieve license information for ${owner}/${repo}: ${error}`);
    throw error;
  }
}


/**
 * Parse a file containing URLs and calculate metrics for each repository.
 * 
 * @param filepath - The file path to the file containing GitHub or npm package URLs (one per line).
 */
export async function parseUrlFile(filepath: string) {
  // Read the file and split the content into an array of URLs
  const urls = fs.readFileSync(filepath, 'utf-8').split('\n').filter(Boolean);  // Removes empty lines

  // Create NDJSON file
  fs.writeFile(`${filepath}.NDJSON`, '', err => {
    if (err) {
      console.error(err);
    } else {
      // File written successfully
    }
  });

  // Loop through each URL and calculate the metrics
  for (const githubUrl of urls) {
    const result = await calculateMetricsForRepo(githubUrl);
    console.log(result);
    fs.appendFileSync(`${filepath}.NDJSON`, `${result}\n`);
  }
}
