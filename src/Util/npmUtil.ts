import request from 'sync-request';

function isNpmLink(url: string): boolean {
    // Regex to check if the input is an npmjs URL
    const npmRegex = /^(https?:\/\/)?(www\.)?npmjs\.com\/package\/(.+)$/;
    return npmRegex.test(url);
}

export function getGithubLink(url: string): string {
    if (isNpmLink(url)) {
        const packageName = url.split('/').pop(); // Extract package name from the URL

        try {
            // Fetch the package details from the npm registry
            const res = request('GET', `https://registry.npmjs.org/${packageName}`);
            const packageData = JSON.parse(res.getBody('utf8'));

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