import axios from 'axios';

// GitHub API token
const GITHUB_TOKEN = '';

// GitHub API base URL
const GITHUB_API_BASE_URL = 'https://api.github.com';

/**
 * Fetch contributors from a GitHub repository
 * @param owner Repository owner (username or organization)
 * @param repo Repository name
 */
async function fetchContributors(owner: string, repo: string) {
  try {
    const response = await axios.get(`${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/contributors`, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching contributors: ${error}`);
    throw error;
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
 * Calculate the Bus Factor for a given GitHub URL and return the result as a formatted string
 * @param githubUrl The GitHub URL of the repository
 */
async function calculateBusFactorForRepo(githubUrl: string): Promise<string> {
  // Parse the owner and repo from the URL
  const repoInfo = parseGithubUrl(githubUrl);

  if (!repoInfo) {
    return `Invalid GitHub URL: ${githubUrl}`;
  }

  const { owner, repo } = repoInfo;

  try {
    // Fetch contributors
    const contributors = await fetchContributors(owner, repo);

    // Calculate Bus Factor
    const busFactor = calculateBusFactor(contributors, 50);
    return `The Bus Factor for ${owner}/${repo} is: ${busFactor}`;
  } catch (error) {
    return `Error calculating Bus Factor for ${owner}/${repo}: ${error}`;
  }
}

/**
 * Main function to execute the process, calling the Bus Factor calculation for a specific GitHub URL.
 */
async function main() {
  // Hardcoded GitHub repository URL
  const githubUrl = 'https://github.com/axios/axios';

  // Call the function to calculate the Bus Factor and get the result string
  const result = await calculateBusFactorForRepo(githubUrl);

  // Print the result
  console.log(result);
}

// Run the main function
main();

