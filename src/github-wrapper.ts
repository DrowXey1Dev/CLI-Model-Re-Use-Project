import { functionTimer } from './function-timer';
import { calculateCorrectness } from './find-correctness';
import { calculateResponsiveMaintener } from './find-responsive-maintainer';
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
 * Fetch repository details from GitHub to calculate the Ramp-Up score.
 * @param owner Repository owner (username or organization)
 * @param repo Repository name
 */
async function fetchRepoDetails(owner: string, repo: string) {
  try {
    const response = await axios.get(`${Util.Constants.GITHUB_API_BASE_URL}/repos/${owner}/${repo}`, {
      headers: {
        Authorization: `token ${Util.Constants.GITHUB_TOKEN}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching repository details: ${error}`);
    throw error;
  }
}

/**
 * Calculate Ramp-Up score for the repository based on several factors.
 * The score is based on the presence of a README file, open issues, and the presence of a docs folder.
 * @param owner Repository owner (username or organization)
 * @param repo Repository name
 */
async function calculateRampUp(owner: string, repo: string): Promise<number> {
  try {
    const repoDetails = await fetchRepoDetails(owner, repo);

    let rampUpScore = 0;

    // Check if README.md exists (5 points if present)
    const hasReadme = repoDetails.has_wiki || repoDetails.description;
    if (hasReadme) {
      rampUpScore += 5;  // README is present
    }

    // Consider the number of open issues (fewer issues = better ramp-up score)
    const openIssues = repoDetails.open_issues_count;
    if (openIssues < 10) {
      rampUpScore += 5;  // Very few open issues
    } else if (openIssues < 50) {
      rampUpScore += 3;  // Moderate number of open issues
    } else {
      rampUpScore += 1;  // High number of open issues
    }

    return rampUpScore;

  } catch (error) {
    console.error(`Error calculating Ramp-Up score for ${owner}/${repo}: ${error}`);
    return 0;
  }
}

/**
 * Calculate Bus Factor
 * @param contributors List of contributors with commit count
 * @param threshold Contribution threshold for bus factor (default 50%)
 */
function calculateBusFactor(contributors: any[], threshold: number = 50): number {
  const totalCommits = contributors.reduce((acc, contributor) => acc + contributor.contributions, 0);
  const sortedContributors = contributors.sort((a, b) => b.contributions - a.contributions);

  let commitSum = 0;
  let busFactor = 0;

  for (const contributor of sortedContributors) {
    commitSum += contributor.contributions;
    busFactor += 1;
    const contributionPercentage = (commitSum / totalCommits) * 100;
    if (contributionPercentage >= threshold) {
      break;
    }
  }

  return busFactor;
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
          - Maintenance: ${maintainResponsiveness}`;
    return result;

    return `For ${owner}/${repo}:\n - Bus Factor ${busFactor.output}\n - Bus Factor Latency ${busFactor.time}\n - Ramp-Up Score: ${rampUpScore.output}/10\n - Ramp-Up Score Latency ${rampUpScore.time}\n - License: ${retrievedLicense.output.name}\n - License Latency ${retrievedLicense.time}\n`;

    
  
  } catch (error) {
    return `Error calculating Bus Factor for ${owner}/${repo}: ${error}`;
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

