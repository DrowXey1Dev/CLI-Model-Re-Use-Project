import axios from 'axios';
import { fetchContributors, repoIssues, repoPullRequests, commitHistory } from '../../src/api-calls/github-adapter'; 

jest.mock('axios');

const GITHUB = 'https://api.github.com';

describe('GitHub API Calls', () => {
  const mockedAxios = axios as jest.Mocked<typeof axios>;

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

 //testing the api call repoIssues to check if it works as intended

  it('should fetch contributors for a repository', async () => {
    const mockContributors = [
      { login: 'user1', contributions: 100 },
      { login: 'user2', contributions: 50 },
    ];
    
    // Mock axios.get to return mockContributors
    mockedAxios.get.mockResolvedValue({ data: mockContributors });

    const result = await fetchContributors('owner', 'repo');
    expect(result).toEqual(mockContributors);
    expect(axios.get).toHaveBeenCalledWith(
      `${GITHUB}/repos/owner/repo/contributors`,
      expect.objectContaining({
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
        },
      })
    );
   });


  //testing the api call repoIssues to check if it works as intended

  it('should fetch issues for a repository', async () => {
    const mockIssues = [
      { title: 'Issue 1', state: 'open' },
      { title: 'Issue 2', state: 'closed' },
    ];

    mockedAxios.get.mockResolvedValue({ data: mockIssues });

    const result = await repoIssues('owner', 'repo');
    expect(result).toEqual(mockIssues);
    expect(axios.get).toHaveBeenCalledWith(
      `${GITHUB}/repos/owner/repo/issues`,
      expect.objectContaining({
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
        },
      })
    );
  });

   //testing the api call repoPullRequests to check if it works as intended

  it('should fetch pull requests for a repository', async () => {
    const mockPullRequests = [
      { title: 'PR 1', state: 'open' },
      { title: 'PR 2', state: 'closed' },
    ];

    mockedAxios.get.mockResolvedValue({ data: mockPullRequests });

    const result = await repoPullRequests('owner', 'repo');
    expect(result).toEqual(mockPullRequests);
    expect(axios.get).toHaveBeenCalledWith(
      `${GITHUB}/repos/owner/repo/pulls`,
      expect.objectContaining({
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
        },
      })
    );
  });


 //testing the api call commitHistory to check if it works as intended

  it('should fetch commit history for a repository', async () => {
    const mockCommits = [
      { commit: { message: 'Initial commit', author: { date: '2021-01-01' } } },
      { commit: { message: 'Add feature', author: { date: '2021-02-01' } } },
    ];

    mockedAxios.get.mockResolvedValue({ data: mockCommits });

    const result = await commitHistory('owner', 'repo');
    expect(result).toEqual(mockCommits);
    expect(axios.get).toHaveBeenCalledWith(
      `${GITHUB}/repos/owner/repo/commits`,
      expect.objectContaining({
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
        },
      })
    );
  });  
});


describe('GitHub API Calls - Error Handling', () => {
    const mockedAxios = axios as jest.Mocked<typeof axios>;
  
    afterEach(() => {
      jest.clearAllMocks(); // Clear mocks after each test
    });
  
    // Silence console.error for all tests and restore it after each test
    let consoleErrorMock: jest.SpyInstance;
  
    beforeAll(() => {
      consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
    });
  
    afterAll(() => {
      consoleErrorMock.mockRestore(); // Restore console.error after the tests
    });

    //handle errors when fetching contributors
  
    it('should handle errors when fetching contributors', async () => {
      const error = new Error('API Error');
      mockedAxios.get.mockRejectedValue(error);
  
      await expect(fetchContributors('owner', 'repo')).rejects.toThrow('API Error');
      expect(axios.get).toHaveBeenCalled();
    });

    //handle errors when fetching issues
  
    it('should handle errors when fetching issues', async () => {
      const error = new Error('API Error');
      mockedAxios.get.mockRejectedValue(error);
  
      await expect(repoIssues('owner', 'repo')).rejects.toThrow('API Error');
      expect(axios.get).toHaveBeenCalled();
    });

    //handle errors when fetching pull requests
  
    it('should handle errors when fetching pull requests', async () => {
      const error = new Error('API Error');
      mockedAxios.get.mockRejectedValue(error);
  
      await expect(repoPullRequests('owner', 'repo')).rejects.toThrow('API Error');
      expect(axios.get).toHaveBeenCalled();
    });
  
    //handle errors when fetching commit history

    it('should handle errors when fetching commit history', async () => {
      const error = new Error('API Error');
      mockedAxios.get.mockRejectedValue(error);
  
      await expect(commitHistory('owner', 'repo')).rejects.toThrow('API Error');
      expect(axios.get).toHaveBeenCalled();
    });
  });