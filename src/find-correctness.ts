import { commitHistory, repoIssues, repoPullRequests } from "./api-calls/github-adapter";

export async function calculateCorrectness(owner: string, repo: string): Promise<number>{
    const issues = await repoIssues(owner, repo);
    const openIssues = issues.filter((issue: any) => {
        const issueDate = new Date(issue.created_at);
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        return issueDate < sixMonthsAgo;
      }).length;
    // const dependeciesVulnerable = await repoDependenciesCheck(owner, repo);
    const pullRequestRate = await repoPullRequests(owner, repo);
    const checkCommitHistory = await commitHistory(owner, repo)
    const recentCommits = checkCommitHistory.filter((commit:any) => {
        const commitDate = new Date(commit.commit.author.date);
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        return commitDate > oneMonthAgo;
      }).length;

    function checkForAmountIssues(): number{
        let score = 10;
        if(issues.length > 30){
            score -= 10;
        }else if(issues.length >15){
            score-=5;
        }else if(issues.length >7){
            score-=2
        }else{
            score= score;
        }
        return score;
    }

    function checkForOpenIssuesLonger6Months(): number{
        let score = 10;
        if(openIssues > 13){
            score -= 10;
        }else if(openIssues >7){
            score-=5;
        }else if(openIssues > 3){
            score-=2;
        }else{
            score= score;
        }
        return score;
    }

    function checkForPrCount(): number{
        let score = 10;
        if(pullRequestRate.length > 30){
            score -= 10;
        }else if(pullRequestRate.length >15){
            score-=5;
        }else if(pullRequestRate.length >7){
            score-=2;
        }else{
            score= score;
        }
        return score;
    }

    function checkForCommitHistory(): number{
        let score = 10;
        if(recentCommits > 10){
            score = score;
        }else if(recentCommits >5){
            score-=3;
        }else if(recentCommits >2){
            score-=5;
        }else{
            score= score;
        }
        return score;
    }

    // function checkForVulnerabilities(): number{
    //     let score = 10;
    //     if(dependeciesVulnerable.length>10){
    //         score-=10
    //     }else if(dependeciesVulnerable.length>5){
    //         score-=5
    //     }else{
    //         score = score
    //     }
    //     return score;
    // }

    const finalScore = (
        // checkForVulnerabilities() +
        checkForCommitHistory() +
        checkForPrCount() +
        checkForOpenIssuesLonger6Months() +
        checkForAmountIssues()
    ) / 5;

    const normalizedScore = Math.min(finalScore / 10, 1);
    return normalizedScore;
}
