import fetch from 'node-fetch';

/**
 * Checks whether the provided URL is a valid npm package link.
 *
 * @param url - The URL to check.
 * @returns `true` if the URL is an npm package URL, otherwise `false`.
 */
function isNpmLink(url: string): boolean {
    // Regex to check if the input is an npmjs URL
    const npmRegex = /^(https?:\/\/)?(www\.)?npmjs\.com\/package\/(.+)$/;
    return npmRegex.test(url);
}

/**
 * Extracts and returns the GitHub repository URL from an npm package URL.
 * If the provided URL is a GitHub repository URL, it returns the cleaned version of it.
 *
 * @param url - The npm or GitHub URL to process.
 * @returns The GitHub repository URL if found, or the original URL if it is not an npm link or no repository is found.
 */
export async function getGithubLink(url: string): Promise<string> {
    if (isNpmLink(url)) {
        const packageName = url.split('/').pop(); // Extract package name from the URL

        try {
            // Fetch the package details from the npm registry
            const response = await fetch(`https://registry.npmjs.org/${packageName}`);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const packageData = await response.json();

            // Extract the GitHub repository URL if it exists
            let repositoryUrl = packageData.repository?.url;
            if (repositoryUrl) {
                // Clean up "git+" prefix if exists
                if (repositoryUrl.startsWith('git+')) {
                    repositoryUrl = repositoryUrl.replace('git+', 'https://');
                }

                // Clean up "ssh://git@" pattern which combines both SSH and GitHub
                if (repositoryUrl.startsWith('ssh://git@github.com/')) {
                    repositoryUrl = repositoryUrl.replace('ssh://git@github.com/', 'https://github.com/');
                }

                // Clean up other SSH URLs in "git@github.com:owner/repo" format
                if (repositoryUrl.startsWith('git@github.com:')) {
                    repositoryUrl = repositoryUrl.replace('git@github.com:', 'https://github.com/');
                }

                // Remove any trailing ".git" from the URL
                repositoryUrl = repositoryUrl.replace(/\.git$/, '');

                // Final check: remove unnecessary `https://ssh://` prefix if it exists
                repositoryUrl = repositoryUrl.replace(/^https:\/\/ssh:\/\/git@github\.com\//, 'https://github.com/');

                return repositoryUrl;
            }
        } catch (error) {
            console.error('Error fetching package details:', error);
        }
    }
    return url;
}

