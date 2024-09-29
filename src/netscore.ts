/**
 * Calculate Net Score for a given GitHub repository based on multiple metrics.
 * @param busFactor The bus factor score
 * @param rampUpScore The ramp-up score
 * @param correctness The correctness score
 * @param responsiveMaintainer The responsive maintainer score
 */
export function calculateNetScore(
    busFactor: number,
    rampUpScore: number,
    correctness: number,
    responsiveMaintainer: number
): number {
    // If any of the scores are -1, return -1 indicating an invalid net score
    if ([busFactor, rampUpScore, correctness, responsiveMaintainer].includes(-1)) {
        return -1;
    }

    // Calculate the net score as an average of all four metrics
    const netScore = (busFactor + rampUpScore + correctness + responsiveMaintainer) / 4;

    return netScore;
}
