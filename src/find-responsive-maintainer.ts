import { commitHistory, repoIssues, repoPullRequests } from "./api-calls/github-adapter";

/**
 * Calculates the responsiveness score of a repository maintainer based on various factors like
 * issue resolution time, pull request closure time, and recent commit activity.
 *
 * @param owner - The owner of the GitHub repository (username or organization).
 * @param repo - The name of the GitHub repository.
 * @returns A Promise that resolves to a score (0-10) representing the responsiveness of the maintainer.
 */
export async function calculateResponsiveMaintener(owner: string, repo: string): Promise<number> {
    const issues = await repoIssues(owner, repo);
    const closedIssues = issues.filter((solved: any) => solved.closed_at !== null);
    
    // Calculate the time it took to close each issue
    const timeToClose = closedIssues.map((issue: any) => {
        const issueOpened = new Date(issue.created_at);
        const issueClosed = new Date(issue.closed_at);
        const timeDifference = (issueClosed.getTime() - issueOpened.getTime()) / (1000 * 60 * 60 * 24); // in days
        return timeDifference;
    });

    const commit = await commitHistory(owner, repo);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    // Filter commits from the past month
    const commitsThisMonth = commit.filter((commits: any) => {
        const commitDate = new Date(commits.commit.author.date);
        return commitDate >= oneMonthAgo;
    });
    const numberOfRecentCommits = commitsThisMonth.length;

    const pullRequests = await repoPullRequests(owner, repo);
    const closedPullRequests = pullRequests.filter((pr: any) => pr.closed_at !== null);
    
    // Calculate the time it took to close each pull request
    const timeToClosePr = closedPullRequests.map((closed: any) => {
        const openedDate = new Date(closed.created_at);
        const closedDate = new Date(closed.closed_at);
        const timeDifference = (closedDate.getTime() - openedDate.getTime()) / (1000 * 60 * 60 * 24); // in days
        return timeDifference;
    });

    /**
     * Calculates the average of an array of numbers.
     *
     * @param times - Array of numbers representing time durations.
     * @returns The average of the numbers in the array.
     */
    function calculateAverage(times: number[]): number {
        if (times.length === 0) return 0;
        return times.reduce((acc, val) => acc + val, 0) / times.length;
    }

    /**
     * Calculates a score based on the average time it takes to close pull requests.
     *
     * @returns A score (0-10) based on the time it takes to close pull requests.
     */
    function checkHowLongPrGetClose(): number {
        const averageTimeToClosePr = calculateAverage(timeToClosePr);
        let score = 10;
        if (averageTimeToClosePr > 20) {
            score -= 10;
        } else if (averageTimeToClosePr > 15) {
            score -= 5;
        } else if (averageTimeToClosePr > 10) {
            score -= 3;
        }
        return score;
    }

    /**
     * Calculates a score based on how frequently commits have been made recently.
     *
     * @returns A score (0-10) based on recent commit activity.
     */
    function howOftenIsThereCommited(): number {
        let score = 10;
        if (numberOfRecentCommits === 0) {
            score -= 10;
        } else if (numberOfRecentCommits <= 1) {
            score -= 5;
        } else if (numberOfRecentCommits <= 3) {
            score -= 3;
        } else {
            score = 10;
        }
        return score;
    }

    /**
     * Calculates a score based on the average time it takes to resolve issues.
     *
     * @returns A score (0-10) based on the time it takes to resolve issues.
     */
    function timeTakesIssueGetSolved(): number {
        const averageTimeToCloseIssues = calculateAverage(timeToClose);
        let score = 10;
        if (averageTimeToCloseIssues > 20) {
            score -= 10;
        } else if (averageTimeToCloseIssues > 15) {
            score -= 5;
        } else if (averageTimeToCloseIssues > 10) {
            score -= 3;
        }
        return score;
    }

    // Calculate the final responsiveness score based on the three factors
    const finalScore = (
        (checkHowLongPrGetClose() +
        howOftenIsThereCommited() +
        timeTakesIssueGetSolved()) / 3
    );

    const normalizedScore = Math.min(finalScore / 10, 1);
    return normalizedScore;
}
