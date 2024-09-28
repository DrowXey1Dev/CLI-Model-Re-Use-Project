import axios from 'axios';
import * as Util from './Util';
import * as API from './api-calls/github-adapter';
import { calculateCorrectness } from './find-correctness';
import { calculateResponsiveMaintener } from './find-responsive-maintainer';


if (!Util.Constants.GITHUB_TOKEN) {
  Util.Logger.logErrorAndExit('Error: GITHUB_TOKEN is not set in the environment.');
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
 * Calculate the Bus Factor for a given GitHub URL and return the result as a formatted string
 * @param githubUrl The GitHub URL of the repository
 */
async function calculateMetricsForRepo(githubUrl: string): Promise<string> {
  // Parse the owner and repo from the URL
  const repoInfo = parseGithubUrl(githubUrl);

  if (!repoInfo) {
    return `Invalid GitHub URL: ${githubUrl}`;
  }

  const { owner, repo } = repoInfo;

  try {
    // Fetch contributors
    const contributors = await API.fetchContributors(owner, repo);

    // Calculate Bus Factor
    const busFactor = calculateBusFactor(contributors, 50);
    const correctnessScore = await calculateCorrectness(owner,repo);
    const maintainedWell = await calculateResponsiveMaintener(owner, repo);
    const result = `
      The Bus Factor for ${owner}/${repo} is: ${busFactor}.
      The Correctness Score is: ${correctnessScore}.
      The maintenance of the repo Score is: ${maintainedWell}.`;
    return result;
    
  } catch (error) {
    return `Error calculating Bus Factor for ${owner}/${repo}: ${error}`;
  }
}

/**
 * Main function to execute the process, calling the Bus Factor calculation for a specific GitHub URL.
 */
async function main() {

  // Call the function to calculate the Bus Factor and get the result string
  const result = await calculateMetricsForRepo(Util.Constants.githubUrl);

  // Print the result
  console.log(result);
}

// Run the main function
main();

