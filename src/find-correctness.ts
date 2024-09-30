import { commitHistory, repoIssues, repoPullRequests } from "./api-calls/github-adapter";

/**
 * Calculates the correctness score of a GitHub repository.
 * The score is determined based on various repository metrics such as open issues,
 * pull request activity, and recent commit history.
 *
 * @param owner - The GitHub username or organization that owns the repository.
 * @param repo - The name of the GitHub repository.
 * @returns A Promise that resolves to a correctness score (0-10).
 */
export async function calculateCorrectness(owner: string, repo: string): Promise<number> {
    const issues = await repoIssues(owner, repo);
    const openIssues = issues.filter((issue: any) => {
        const issueDate = new Date(issue.created_at);
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        return issueDate < sixMonthsAgo;
    }).length;

    const pullRequestRate = await repoPullRequests(owner, repo);
    const checkCommitHistory = await commitHistory(owner, repo);
    const recentCommits = checkCommitHistory.filter((commit: any) => {
        const commitDate = new Date(commit.commit.author.date);
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        return commitDate > oneMonthAgo;
    }).length;

    /**
     * Calculates a score based on the total number of issues.
     *
     * @returns A score based on the number of issues in the repository (0-10).
     */
    function checkForAmountIssues(): number {
        let score = 10;
        if (issues.length > 30) {
            score -= 10;
        } else if (issues.length > 15) {
            score -= 5;
        } else if (issues.length > 7) {
            score -= 2;
        }
        return score;
    }

    /**
     * Calculates a score based on the number of open issues that are older than 6 months.
     *
     * @returns A score based on the number of old open issues (0-10).
     */
    function checkForOpenIssuesLonger6Months(): number {
        let score = 10;
        if (openIssues > 13) {
            score -= 10;
        } else if (openIssues > 7) {
            score -= 5;
        } else if (openIssues > 3) {
            score -= 2;
        }
        return score;
    }

    /**
     * Calculates a score based on the number of pull requests.
     *
     * @returns A score based on pull request activity (0-10).
     */
    function checkForPrCount(): number {
        let score = 10;
        if (pullRequestRate.length > 30) {
            score -= 10;
        } else if (pullRequestRate.length > 15) {
            score -= 5;
        } else if (pullRequestRate.length > 7) {
            score -= 2;
        }
        return score;
    }

    /**
     * Calculates a score based on recent commit history (last month).
     *
     * @returns A score based on recent commits (0-10).
     */
    function checkForCommitHistory(): number {
        let score = 10;
        if (recentCommits > 10) {
            score = score;
        } else if (recentCommits > 5) {
            score -= 3;
        } else if (recentCommits > 2) {
            score -= 5;
        }
        return score;
    }

    // The vulnerabilities check is commented out, but would affect the final score based on the number of dependencies vulnerabilities.
    // function checkForVulnerabilities(): number {
    //     let score = 10;
    //     if (dependeciesVulnerable.length > 10) {
    //         score -= 10;
    //     } else if (dependeciesVulnerable.length > 5) {
    //         score -= 5;
    //     }
    //     return score;
    // }

    const finalScore = (
        // checkForVulnerabilities() +
        checkForCommitHistory() +
        checkForPrCount() +
        checkForOpenIssuesLonger6Months() +
        checkForAmountIssues()
    ) / 5;

    const normalizedScore = Math.min(finalScore / 10, 1);
    return normalizedScore;
}
