export const logErrorAndExit = (message: string): void => {
    console.error(`Error: ${message}`);
    process.exit(1);  // Exit the process
  };