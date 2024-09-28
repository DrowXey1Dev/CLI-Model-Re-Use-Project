export async function functionTimer<T>(fn: () => T | Promise<T>): Promise<{ output: T; time: number }> {
    const start = performance.now();  // Start timing
    const output = await Promise.resolve(fn()); // Resolve either sync or async function
    const end = performance.now();    // End timing

    const time = end - start;         // Calculate time taken
    return { output, time };          // Return output and time taken
}