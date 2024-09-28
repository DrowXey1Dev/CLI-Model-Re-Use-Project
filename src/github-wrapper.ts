import { functionTimer } from './function-timer';
import { calculateCorrectness } from './find-correctness';
import { calculateResponsiveMaintener } from './find-responsive-maintainer';
import { calculateBusFactor } from './bus-factor';
import { calculateRampUp } from './ramp-up';
import { calculateNetScore } from './netscore';
import { getGithubLink } from './Util/npmUtil';

import * as Util from './Util';
import * as API from './api-calls/github-adapter';

import axios from 'axios';
import fs from 'fs';
import path from 'path';

if (!Util.Constants.GITHUB_TOKEN) {
  Util.Logger.logErrorAndExit('Error: GITHUB_TOKEN is not set in the environment.');
}

/**
 * Parse a GitHub repository URL to extract the owner and repo name
 * @param url GitHub repository URL
 */
function parseGithubUrl(url: string): { owner: string, repo: string } | null {
  const match = url.match(/https:\/\/github\.com\/([^/]+)\/([^/]+)/);
  if (match && match[1] && match[2]) {
    return { owner: match[1], repo: match[2] };
  }
  return null;
}

/**
 * Calculate the metrics for a given GitHub URL and return the result as a formatted string
 * @param githubUrl The GitHub URL of the repository
 */
export async function calculateMetricsForRepo(url: string): Promise<string> {
  // Parse the owner and repo from the URL
  const githubUrl = getGithubLink(url);
  const repoInfo = parseGithubUrl(githubUrl);

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

    const correctness = await calculateCorrectness(owner, repo);

    const maintainResponsiveness = await calculateResponsiveMaintener(owner, repo);

    // Calculate NetScore
    const netScore = calculateNetScore(
          busFactor.output,
          rampUpScore.output,
          correctness,
          maintainResponsiveness
     );

    //var ndjsonOutputString = busFactor.output;

    const result = `
          For ${owner}/${repo}:
          - Bus Factor ${busFactor.output}.
          - Bus Factor Latency ${busFactor.time}
          - Ramp-Up Score: ${rampUpScore.output}/10
          - Ramp-Up Score Latency ${rampUpScore.time}
          - License: ${retrievedLicense.output.name}
          - License Latency ${retrievedLicense.time}
          - Correctness:  ${correctness}
          - Maintenance: ${maintainResponsiveness}
          - NetScore: ${netScore.toFixed(2)}`;
    return result;
    
  
  } catch (error) {
    return `Error calculating Metrics for ${owner}/${repo}: ${error}`;
  }
}
/**
 * Fetch the license information from a GitHub repository.
 * @param owner Repository owner (username or organization)
 * @param repo Repository name
 */
async function fetchRepoLicense(owner: string, repo: string) {
  try {
      const response = await axios.get(`${Util.Constants.GITHUB_API_BASE_URL}/repos/${owner}/${repo}/license`, {
          headers: {
              Authorization: `token ${Util.Constants.GITHUB_TOKEN}`,
          },
      });
      return response.data.license;
  } catch (error) {
      console.error(`ERROR! Failed to retrieve license information for ${owner}/${repo}: ${error}`);
      throw error;
  }
}


/**
 * Main function to read a list of GitHub URLs from a text file and calculate metrics for each.
 */
async function main() {
  // Path to the file containing GitHub URLs
  const urlFilePath = path.join(__dirname, 'url_file.txt');

  // Read the file and split the content into an array of URLs
  const urls = fs.readFileSync(urlFilePath, 'utf-8').split('\n').filter(Boolean);  // Removes empty lines

  // Loop through each URL and calculate the metrics
  for (const githubUrl of urls) {
    const result = await calculateMetricsForRepo(githubUrl);
    console.log(result);
  }
}

// Run the main function
main();

