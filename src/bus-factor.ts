/**
 * Calculate Bus Factor Score
 * @param contributors List of contributors with commit count
 * @param threshold Contribution threshold for bus factor (50%)
 */
export function calculateBusFactor(contributors: any[], threshold: number = 50): number {
    if (contributors.length === 0) {
        // No contributors, return -1 indicating an undefined bus factor
        return -1;
    }

    const totalCommits = contributors.reduce((acc, contributor) => acc + contributor.contributions, 0);
    const sortedContributors = contributors.sort((a, b) => b.contributions - a.contributions);

    let commitSum = 0;
    let busFactor = 0;

    // Calculate the number of contributors required to reach the threshold
    for (const contributor of sortedContributors) {
        commitSum += contributor.contributions;
        busFactor += 1;
        const contributionPercentage = (commitSum / totalCommits) * 100;
        if (contributionPercentage >= threshold) {
            break;
        }
    }

    // Normalize the bus factor as a score between 0 and 1
    const busFactorScore = busFactor / contributors.length;

    // Ensure the score is within the expected range [0, 1]
    return Math.min(Math.max(busFactorScore, 0), 1);
}