# *Git hub & NPM metrics analyzer*

## Purpose
This analyzer is a CLI tool designed to analyze GitHub and NPM repositories and calculate important metrics that reflect the repository's health. Specifically, it calculates:
  - **Bus Factor**: A measure of how many key contributors are needed to achieve 50% of the total commits.
  - **Correctness**
  - **Ramp Up**: A score out of 10 that estimates how easy it is to understand and contribute to the project based on the presence of documentation and the number of open issues.
  - **Responsive Maintainer**
  - **License**
  - **NetScore**

## Installation and Setup
 - **dependencies**: all neccessary dependencies can be installed using the ./run install command.
 - **GitHub token**: To access GitHub's API, you need a personal access token saved as a variable in your local environment called **GITHUB_TOKEN**.
