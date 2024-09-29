/**
 * Calculate Bus Factor
 * @param contributors List of contributors with commit count
 * @param threshold Contribution threshold for bus factor (default 50%)
 */
export function calculateBusFactor(contributors: any[], threshold: number = 50): number {
    const totalCommits = contributors.reduce((acc, contributor) => acc + contributor.contributions, 0);
    const sortedContributors = contributors.sort((a, b) => b.contributions - a.contributions);

    let commitSum = 0;
    let busFactor = 0;

    for (const contributor of sortedContributors) {
        commitSum += contributor.contributions;
        busFactor += 1;
        const contributionPercentage = (commitSum / totalCommits) * 100;
        if (contributionPercentage >= threshold) {
            break;
        }
    }

    return busFactor;
}