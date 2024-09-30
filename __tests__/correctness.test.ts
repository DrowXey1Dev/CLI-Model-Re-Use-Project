import { calculateCorrectness } from '../src/find-correctness';  
import { repoIssues, repoPullRequests, commitHistory } from '../src/api-calls/github-adapter';  

jest.mock('../src/api-calls/github-adapter');  // Mock the API calls

const mockedRepoIssues = repoIssues as jest.MockedFunction<typeof repoIssues>;
const mockedRepoPullRequests = repoPullRequests as jest.MockedFunction<typeof repoPullRequests>;
const mockedCommitHistory = commitHistory as jest.MockedFunction<typeof commitHistory>;

describe('calculateCorrectness', () => {
  afterEach(() => {
    jest.clearAllMocks();  // Clear mocks after each test
  });

  //correctness score for a repository with few open issues and few commits

  it('should return a lower correctness score for a repository with more open issues and few commits', async () => {
    // Mocking repoIssues, repoPullRequests, and commitHistory
    mockedRepoIssues.mockResolvedValue([
      { created_at: '2020-01-01' }, { created_at: '2020-02-01' },  // Old issues
      { created_at: '2023-02-01' }, { created_at: '2023-03-01' },
      { created_at: '2020-01-01' }, { created_at: '2020-02-01' },  // Old issues
      { created_at: '2023-02-01' }, { created_at: '2023-03-01' },
      { created_at: '2020-01-01' }, { created_at: '2020-02-01' },  // Old issues
      { created_at: '2023-02-01' }, { created_at: '2023-03-01' },
      { created_at: '2020-01-01' }, { created_at: '2020-02-01' },  // Old issues
      { created_at: '2023-02-01' }, { created_at: '2023-03-01' },
      { created_at: '2020-01-01' }, { created_at: '2020-02-01' },  // Old issues
      { created_at: '2023-02-01' }, { created_at: '2023-03-01' },
      { created_at: '2020-01-01' }, { created_at: '2020-02-01' },  // Old issues
      { created_at: '2023-02-01' }, { created_at: '2023-03-01' },
      { created_at: '2020-01-01' }, { created_at: '2020-02-01' },  // Old issues
      { created_at: '2023-02-01' }, { created_at: '2023-03-01' },
    ]);

    mockedRepoPullRequests.mockResolvedValue([
      { created_at: '2023-02-01', closed_at: '2023-02-10' },  // Few PRs
      { created_at: '2023-02-01', closed_at: '2023-02-10' }, 
      { created_at: '2023-02-01', closed_at: '2023-02-10' }, 
      { created_at: '2023-02-01', closed_at: '2023-02-10' }, 
      { created_at: '2023-02-01', closed_at: '2023-02-10' }, 
      { created_at: '2023-02-01', closed_at: '2023-02-10' }, 
      { created_at: '2023-02-01', closed_at: '2023-02-10' }, 
      { created_at: '2023-02-01', closed_at: '2023-02-10' }, 
      { created_at: '2023-02-01', closed_at: '2023-02-10' }, 
      { created_at: '2023-02-01', closed_at: '2023-02-10' }, 
    ]);

    mockedCommitHistory.mockResolvedValue([
      { commit: { author: { date: '2022-12-01' } } },  // Older commits
      { commit: { author: { date: '2022-12-01' } } },
    ]);

    const score = await calculateCorrectness('owner', 'repo');
    expect(score).toBeLessThan(0.5);  
  });

  //high correctness score for a repository with recent PRs and many commits

  it('should return a high correctness score for a repository with recent PRs and many commits', async () => {
    mockedRepoIssues.mockResolvedValue([
      { created_at: '2023-05-01' }, { created_at: '2023-06-01' },  // Few issues, recent
    ]);

    mockedRepoPullRequests.mockResolvedValue([
      { created_at: '2023-05-01', closed_at: '2023-05-10' },  // Recent PRs
      { created_at: '2023-06-01', closed_at: '2023-06-05' },
    ]);

    mockedCommitHistory.mockResolvedValue([
      { commit: { author: { date: '2023-06-01' } } },  // Recent commits
      { commit: { author: { date: '2023-06-02' } } },
      { commit: { author: { date: '2023-06-03' } } },
    ]);

    const score = await calculateCorrectness('owner', 'repo');
    expect(score).toBeGreaterThan(0.7);  // Expecting a high score
  });


  it('should return a moderate correctness score for a repository with many PRs but old unresolved issues', async () => {
    mockedRepoIssues.mockResolvedValue([
      { created_at: '2022-01-01' }, { created_at: '2021-12-01' },  // Old unresolved issues
      { created_at: '2023-05-01' }, { created_at: '2023-06-01' }
    ]);

    mockedRepoPullRequests.mockResolvedValue([
      { created_at: '2023-05-01', closed_at: '2023-05-10' },  // Many recent PRs
      { created_at: '2023-06-01', closed_at: '2023-06-05' },
      { created_at: '2023-06-10', closed_at: '2023-06-15' },
      { created_at: '2023-07-01', closed_at: '2023-07-05' }
    ]);

    mockedCommitHistory.mockResolvedValue([
      { commit: { author: { date: '2023-06-01' } } },  // Recent commits
      { commit: { author: { date: '2023-06-02' } } },
      { commit: { author: { date: '2023-06-03' } } },
    ]);

    const score = await calculateCorrectness('owner', 'repo');
    expect(score).toBeGreaterThan(0.5);  // Expecting a moderate score
    expect(score).toBeLessThan(0.8);  // But not too high due to old issues
  });


});
