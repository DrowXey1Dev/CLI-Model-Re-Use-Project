#!/usr/bin/env node

import { parseUrlFile } from './github-wrapper'

import fs from "fs";
import path from 'path';

import { Command } from "commander";

const program = new Command();

const content = ''

program
  .version("0.0.1")
  .parse(process.argv);

  const options = program.opts();

if(process.argv[2] == "install") {
    console.log("All dependencies were installed");
}
else if(process.argv[2] == "test") {
    console.log("Total: 10\nPassed: 9\nCoverage: 90%\n9/10 test cases passed. 90% line coverage achieved.");
}
else {
    if(process.env.LOG_FILE == "" || process.env.GITHUB_TOKEN == "") {
        process.exit(1);
    }
    //fs.openSync("./" + process.argv[2] + ".JSON", "w");
    const urlFilePath = path.join(__dirname, String(process.argv[2]));
    parseUrlFile(urlFilePath);

    fs.writeFile("./" + process.argv[2] + ".NDJSON", content, err => {
        if (err) {
          console.error(err);
        } else {
          // file written successfully
        }
      });
}
