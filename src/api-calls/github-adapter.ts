import axios from "axios";
import * as Util from '../Util';

/**
 * Fetch contributors from a GitHub repository
 * @param owner Repository owner (username or organization)
 * @param repo Repository name
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