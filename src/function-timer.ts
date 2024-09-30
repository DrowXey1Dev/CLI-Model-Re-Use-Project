/**
 * Measures the execution time of a synchronous or asynchronous function.
 *
 * @template T - The return type of the input function.
 * @param fn - A function (either synchronous or asynchronous) whose execution time is to be measured.
 * @returns A Promise that resolves to an object containing:
 *   - `output`: The result of the function execution.
 *   - `time`: The time taken (in milliseconds) to execute the function.
 */
export async function functionTimer<T>(fn: () => T | Promise<T>): Promise<{ output: T; time: number }> {
    const start = performance.now();  // Start timing
    const output = await Promise.resolve(fn()); // Resolve either sync or async function
    const end = performance.now();    // End timing

    const time = end - start;         // Calculate time taken
    return { output, time };          // Return output and time taken
}
