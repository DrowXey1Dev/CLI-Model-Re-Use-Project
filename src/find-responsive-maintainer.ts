import axios from "axios";
import * as Util from './Util';
import { commitHistory, repoIssues, repoPullRequests } from "./api-calls/github-adapter";


export async function calculateResponsiveMaintener(owner: string,repo: string): Promise<number>{
    const issues = await repoIssues(owner, repo);
    const closedIssues = issues.filter((solved: any)=> solved.closed_at !== null);
    const timeToClose = closedIssues.map((issue: any)=>{
        const issueOpened = new Date(issue.created_at);
        const issueClosed = new Date(issue.closed_at);
        const timeDifference = (issueClosed.getTime() - issueOpened.getTime()) / (1000 * 60 * 60 * 24);
        return timeDifference;
    });

    const commit = await commitHistory(owner, repo);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const commitsThisMonth = commit.filter((commits: any) => {
        const commitDate = new Date(commits.commit.author.date);
        return commitDate >= oneMonthAgo;
    });
    const numberOfRecentCommits = commitsThisMonth.length;

    const pullRequests = await repoPullRequests(owner, repo);
    const closedPullRequests = pullRequests.filter((pr: any) => pr.closed_at !== null);
    const timeToClosePr = closedPullRequests.map((closed: any)=>{
        const openedDate = new Date(closed.created_at);
        const closedDate = new Date(closed.closed_at);
        const timeDifference = (closedDate.getTime() - openedDate.getTime())/(1000 * 60 * 60 * 24);
        return timeDifference;
    });

    function calculateAverage(times: number[]): number {
        if (times.length === 0) return 0;
        return times.reduce((acc, val) => acc + val, 0) / times.length;
    }

    function checkHowLongPrGetClose(): number{
        const averageTimeToClosePr = calculateAverage(timeToClosePr);
        let score = 10
        if (averageTimeToClosePr > 20){
            score -= 10;
        }else if (averageTimeToClosePr > 15){
            score -= 5
        }else if (averageTimeToClosePr > 10){
            score -= 3
        }
        return score;
    }

    function howOftenIsThereCommited(): number {
        let score = 10;
        if (numberOfRecentCommits === 0) {
            score -= 10;  
        } else if (numberOfRecentCommits <= 1) {
            score -= 5;   
        } else if (numberOfRecentCommits <= 3) {
            score -= 3;  
        }else {
            score = 10; 
        }
        return score;
    }

    function timeTakesIssueGetSolved(): number{
        const averageTimeToCloseIssues = calculateAverage(timeToClose);
        let score = 10
        if (averageTimeToCloseIssues > 20){
            score -= 10;
        }else if (averageTimeToCloseIssues > 15){
            score -= 5
        }else if (averageTimeToCloseIssues > 10){
            score -= 3
        }
        return score;
    }

    const finalScore = (
        (checkHowLongPrGetClose()+
        howOftenIsThereCommited()+
        timeTakesIssueGetSolved()) / 3
    );

    return finalScore;
}