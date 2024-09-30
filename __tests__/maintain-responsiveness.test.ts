import { calculateResponsiveMaintener } from '../src/find-responsive-maintainer'; 
import { repoIssues, repoPullRequests, commitHistory } from '../src/api-calls/github-adapter';  

jest.mock('../src/api-calls/github-adapter');  // Mock the API calls

const mockedRepoIssues = repoIssues as jest.MockedFunction<typeof repoIssues>;
const mockedRepoPullRequests = repoPullRequests as jest.MockedFunction<typeof repoPullRequests>;
const mockedCommitHistory = commitHistory as jest.MockedFunction<typeof commitHistory>;

describe('calculateResponsiveMaintener', () => {
  afterEach(() => {
    jest.clearAllMocks();  // Clear mocks after each test
  });

  //low responsiveness score for a repository with many unresolved issues and few commits

  it('should return a low responsiveness score for a repository with many unresolved issues and few commits', async () => {
    // Mocking repoIssues, repoPullRequests, and commitHistory
    mockedRepoIssues.mockResolvedValue([
      { created_at: '2020-01-01', closed_at: null },  // Old unresolved issues
      { created_at: '2021-01-01', closed_at: null },
    ]);

    mockedRepoPullRequests.mockResolvedValue([
      { created_at: '2023-01-01', closed_at: '2023-03-01' },  // Slow PR closure
    ]);

    mockedCommitHistory.mockResolvedValue([
      { commit: { author: { date: '2022-12-01' } } },  // Old commits, few recent
    ]);

    const score = await calculateResponsiveMaintener('owner', 'repo');
    expect(score).toBeLessThan(0.5);  // Expecting a low responsiveness score
  });

  //high responsiveness score for a repository with recent PRs and frequent commits
  it('should return a high responsiveness score for a repository with recent PRs and frequent commits', async () => {
    mockedRepoIssues.mockResolvedValue([
      { created_at: '2023-05-01', closed_at: '2023-05-10' },  
      { created_at: '2023-06-01', closed_at: '2023-06-05' },
      { created_at: '2023-05-01', closed_at: '2023-05-10' },  
      { created_at: '2023-06-01', closed_at: '2023-06-05' },
      { created_at: '2023-05-01', closed_at: '2023-05-10' },  
      { created_at: '2023-06-01', closed_at: '2023-06-05' },
      { created_at: '2023-05-01', closed_at: '2023-05-10' },  
      { created_at: '2023-06-01', closed_at: '2023-06-05' },
    ]);

    mockedRepoPullRequests.mockResolvedValue([
      { created_at: '2023-05-01', closed_at: '2023-05-10' },  // Fast PR closure
      { created_at: '2023-06-01', closed_at: '2023-06-05' },
      { created_at: '2023-05-01', closed_at: '2023-05-10' }, 
      { created_at: '2023-06-01', closed_at: '2023-06-05' },
      { created_at: '2023-05-01', closed_at: '2023-05-10' }, 
      { created_at: '2023-06-01', closed_at: '2023-06-05' },
    ]);

    mockedCommitHistory.mockResolvedValue([
      { commit: { author: { date: '2024-09-01' } } },  // Recent commits
      { commit: { author: { date: '2024-09-02' } } },
      { commit: { author: { date: '2024-09-03' } } },
      { commit: { author: { date: '2024-09-02' } } },
      { commit: { author: { date: '2024-09-03' } } },
      { commit: { author: { date: '2024-09-02' } } },
      { commit: { author: { date: '2024-09-03' } } },
    ]);

    const score = await calculateResponsiveMaintener('owner', 'repo');
    expect(score).toBeGreaterThan(0.8);  // Expecting a high responsiveness score
  });

  //moderate responsiveness score for a repository with mixed activity
  it('should return a moderate responsiveness score for a repository with mixed activity', async () => {
    mockedRepoIssues.mockResolvedValue([
      { created_at: '2022-01-01', closed_at: '2022-02-01' },  // Old issues, resolved
      { created_at: '2024-07-20', closed_at: '2024-09-20' },  // Recent, resolved slowly
    ]);

    mockedRepoPullRequests.mockResolvedValue([
      { created_at: '2023-05-01', closed_at: '2023-06-01' },  
      { created_at: '2023-06-01', closed_at: '2023-06-05' },
    ]);

    mockedCommitHistory.mockResolvedValue([
      { commit: { author: { date: '2024-09-20' } } },  
      { commit: { author: { date: '2024-09-20' } } },
      { commit: { author: { date: '2024-09-20' } } },  
      { commit: { author: { date: '2024-09-20' } } },
      { commit: { author: { date: '2024-09-25' } } },  
      { commit: { author: { date: '2024-09-27' } } },
    ]);

    const score = await calculateResponsiveMaintener('owner', 'repo');
    expect(score).toBeGreaterThan(0.4);  // Expecting a moderate score
    expect(score).toBeLessThan(0.8);  
  });
});
