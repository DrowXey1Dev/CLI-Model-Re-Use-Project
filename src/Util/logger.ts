/**
 * Logs an error message to the console and exits the process with an error code.
 * 
 * @param message - The error message to be logged before exiting the process.
 */
export const logErrorAndExit = (message: string): void => {
  console.error(`Error: ${message}`);
  process.exit(1);  // Exit the process with error code 1
};
