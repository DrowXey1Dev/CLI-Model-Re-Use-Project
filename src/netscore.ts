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
    // Weights for each metric
    const weights = {
        busFactor: 0.20,
        rampUpScore: 0.25,
        correctness: 0.25,
        responsiveMaintainer: 0.30
    };

    // Calculate weighted sum
    const netScore = (
        (busFactor * weights.busFactor) +
        (rampUpScore * weights.rampUpScore) +
        (correctness * weights.correctness) +
        (responsiveMaintainer * weights.responsiveMaintainer)
    );

    return netScore;
}
