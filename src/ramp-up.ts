import { fetchRepoDetails } from "./api-calls/github-adapter";

/**
 * Calculate Ramp-Up score for the repository based on several factors.
 * The score is based on the presence of a README file, open issues, and the presence of a docs folder.
 * @param owner Repository owner (username or organization)
 * @param repo Repository name
 */
export async function calculateRampUp(owner: string, repo: string): Promise<number> {
    try {
        const repoDetails = await fetchRepoDetails(owner, repo);

        let rampUpScore = 0;

        // Check if README.md exists and has content (base score)
        const hasReadme = repoDetails.has_wiki || repoDetails.description;
        if (hasReadme) {
            rampUpScore += 3;  // README exists and has content
        }

        // Check for a docs folder (additional points for documentation)
        const hasDocsFolder = repoDetails.has_docs; // Assuming has_docs is provided by fetchRepoDetails
        if (hasDocsFolder) {
            rampUpScore += 2;  // Additional documentation present
        }

        // Consider the number of open issues (fewer issues = better ramp-up score)
        const openIssues = repoDetails.open_issues_count;
        if (openIssues < 10) {
            rampUpScore += 3;  // Very few open issues
        } else if (openIssues < 50) {
            rampUpScore += 2;  // Moderate number of open issues
        } else {
            rampUpScore += 1;  // High number of open issues
        }

        // Normalize the score to a range of 0-1 (max possible score = 8)
        const normalizedScore = Math.min(rampUpScore / 8, 1);

        return normalizedScore;

    } catch (error) {
        console.error(`Error calculating Ramp-Up score for ${owner}/${repo}: ${error}`);
        return 0;
    }
}
