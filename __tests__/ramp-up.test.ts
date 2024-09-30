import { calculateRampUp } from '../src/ramp-up';
import { fetchRepoDetails } from '../src/api-calls/github-adapter';

// Mocking `fetchRepoDetails` to control its return value during tests
jest.mock('../src/api-calls/github-adapter', () => ({
    fetchRepoDetails: jest.fn()
}));

describe('Ramp-Up Calculation', () => {
    it('should return a high score for a well-documented repository with few open issues', async () => {
        // Mock return value of `fetchRepoDetails`
        (fetchRepoDetails as jest.Mock).mockResolvedValue({
            has_wiki: true,
            description: "This is a test repo with a README.",
            has_docs: true,
            open_issues_count: 5
        });

        const result = await calculateRampUp('test-owner', 'test-repo');
        expect(result).toBeCloseTo(1, 2); // Close to max normalized score
    });

    it('should return a moderate score for a repository with no docs folder and moderate open issues', async () => {
        (fetchRepoDetails as jest.Mock).mockResolvedValue({
            has_wiki: true,
            description: "README present",
            has_docs: false,
            open_issues_count: 20
        });

        const result = await calculateRampUp('test-owner', 'test-repo');
        expect(result).toBeCloseTo(0.625, 2); // Adjusted expected score to match logic
    });

    it('should return a low score for a repository with no README and many open issues', async () => {
        (fetchRepoDetails as jest.Mock).mockResolvedValue({
            has_wiki: false,
            description: "",
            has_docs: false,
            open_issues_count: 100
        });

        const result = await calculateRampUp('test-owner', 'test-repo');
        expect(result).toBeCloseTo(0.125, 2); // Low normalized score
    });

    it('should handle repositories with no README but few open issues', async () => {
        (fetchRepoDetails as jest.Mock).mockResolvedValue({
            has_wiki: false,
            description: "",
            has_docs: false,
            open_issues_count: 5
        });

        const result = await calculateRampUp('test-owner', 'test-repo');
        expect(result).toBeCloseTo(0.375, 2); // Low-to-moderate normalized score
    });

    it('should handle errors gracefully and return a score of 0', async () => {
        // Mock fetchRepoDetails to throw an error
        (fetchRepoDetails as jest.Mock).mockRejectedValue(new Error('Network error'));

        // Suppress console.error for this test
        const originalError = console.error;
        console.error = jest.fn();

        const result = await calculateRampUp('test-owner', 'test-repo');
        expect(result).toBe(0); // Score should be 0 if an error occurs

        // Restore console.error after the test
        console.error = originalError;
    });
});

