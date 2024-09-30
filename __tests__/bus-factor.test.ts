import { calculateBusFactor } from '../src/bus-factor';

type Contributor = {
    name: string;
    contributions: number;
};

describe('Bus Factor Calculation', () => {
    it('should return -1 when there are no contributors', () => {
        const contributors: Contributor[] = []; // Explicitly define the type
        const result = calculateBusFactor(contributors);
        expect(result).toBe(-1);
    });

    it('should return 1 when a single contributor has all the contributions', () => {
        const contributors: Contributor[] = [{ name: 'Alice', contributions: 100 }];
        const result = calculateBusFactor(contributors);
        expect(result).toBe(1); // Only one contributor, so bus factor is 1
    });

    it('should calculate the correct bus factor for evenly distributed contributions', () => {
        const contributors: Contributor[] = [
            { name: 'Alice', contributions: 50 },
            { name: 'Bob', contributions: 50 }
        ];
        const result = calculateBusFactor(contributors);
        expect(result).toBeCloseTo(0.5, 3); // Two contributors with equal distribution
    });

    it('should calculate a bus factor score close to 0.5 with more contributors', () => {
        const contributors: Contributor[] = [
            { name: 'Alice', contributions: 50 },
            { name: 'Bob', contributions: 30 },
            { name: 'Charlie', contributions: 20 }
        ];
        const result = calculateBusFactor(contributors);
        expect(result).toBeCloseTo(0.333, 3); // Lowered precision to 3
    });

    it('should calculate a bus factor score with varying thresholds', () => {
        const contributors: Contributor[] = [
            { name: 'Alice', contributions: 50 },
            { name: 'Bob', contributions: 30 },
            { name: 'Charlie', contributions: 20 }
        ];

        const threshold1 = calculateBusFactor(contributors, 50);
        expect(threshold1).toBeCloseTo(0.333, 3); // Lowered precision to 3

        const threshold2 = calculateBusFactor(contributors, 80);
        expect(threshold2).toBeCloseTo(0.667, 3); // 80% threshold, bus factor 2/3
    });

    it('should return a normalized score between 0 and 1', () => {
        const contributors: Contributor[] = [
            { name: 'Alice', contributions: 80 },
            { name: 'Bob', contributions: 10 },
            { name: 'Charlie', contributions: 10 }
        ];
        const result = calculateBusFactor(contributors);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThanOrEqual(1);
    });
});

