import axios from "axios";
import * as Util from '../Util';

/**
 * Fetches a list of contributors for a GitHub repository.
 * @param {string} owner - The username or organization of the repository owner.
 * @param {string} repo - The name of the repository.
 * @returns {Promise<Object[]>} A promise that resolves to an array of contributors.
 * @throws Will throw an error if the request fails.
 */
export async function fetchContributors(owner: string, repo: string) {
    try {
      const response = await axios.get(`${Util.Constants.GITHUB_API_BASE_URL}/repos/${owner}/${repo}/contributors`, {
        headers: {
          Authorization: `token ${Util.Constants.GITHUB_TOKEN}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching contributors: ${error}`);
      throw error;
    }
  }

  /**
 * Fetches all issues from a GitHub repository.
 * @param {string} owner - The username or organization of the repository owner.
 * @param {string} repo - The name of the repository.
 * @returns {Promise<Object[]>} A promise that resolves to an array of issues.
 * @throws Will throw an error if the request fails.
 */
  export async function repoIssues(owner: string, repo: string) {
    try {
      const response = await axios.get(`${Util.Constants.GITHUB_API_BASE_URL}/repos/${owner}/${repo}/issues`, {
        headers: {
          Authorization: `token ${Util.Constants.GITHUB_TOKEN}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching issues: ${error}`);
      throw error;
    }
  }

/**
 * Fetches all pull requests for a GitHub repository.
 * @param {string} owner - The username or organization of the repository owner.
 * @param {string} repo - The name of the repository.
 * @returns {Promise<Object[]>} A promise that resolves to an array of pull requests.
 * @throws Will throw an error if the request fails.
 */
  export async function repoPullRequests(owner: string, repo: string) {
    try {
      const response = await axios.get(`${Util.Constants.GITHUB_API_BASE_URL}/repos/${owner}/${repo}/pulls`, {
        headers: {
          Authorization: `token ${Util.Constants.GITHUB_TOKEN}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching PRs: ${error}`);
      throw error;
    }
  }

/**
 * Fetches the commit history for a GitHub repository.
 * @param {string} owner - The username or organization of the repository owner.
 * @param {string} repo - The name of the repository.
 * @returns {Promise<Object[]>} A promise that resolves to an array of commits.
 * @throws Will throw an error if the request fails.
 */
  export async function commitHistory(owner: string, repo: string) {
    try {
      const response = await axios.get(`${Util.Constants.GITHUB_API_BASE_URL}/repos/${owner}/${repo}/commits`, {
        headers: {
          Authorization: `token ${Util.Constants.GITHUB_TOKEN}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching issues: ${error}`);
      throw error;
    }
  }

/**
* Fetch repository details from GitHub to calculate the Ramp-Up score.
* @param owner Repository owner (username or organization)
* @param repo Repository name
*/
export async function fetchRepoDetails(owner: string, repo: string) {
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

  // export async function repoDependenciesCheck(owner: string, repo: string) {
  //   try {
  //     const response = await axios.get(`${Util.Constants.GITHUB_API_BASE_URL}/repos/${owner}/${repo}/dependency-graph/snapshots`, {
  //       headers: {
  //         Authorization: `token ${Util.Constants.GITHUB_TOKEN}`,
  //       },
  //     });
  //     return response.data;
  //   } catch (error) {
  //     console.error(`Error fetching repo dependecies: ${error}`);
  //     throw error;
  //   }
  // }