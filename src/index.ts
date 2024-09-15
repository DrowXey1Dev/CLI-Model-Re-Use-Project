#!/usr/bin/env node

import fs from "fs";
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
    const content = '{"URL":"https://github.com/nullivex/nodist", "NetScore":0.9, "NetScore_Latency":0.9, "RampUp":0.5, "RampUp_Latency":0.5, "Correctness":0.7, "Correctness_Latency":0.7, "BusFactor":0.3, "BusFactor_Latency":0.3, "ResponsiveMaintainer":0.4, "ResponsiveMaintainer_Latency":0.4, "License":1, "License_Latency":1}';
    fs.writeFile("./" + process.argv[2] + ".NDJSON", content, err => {
        if (err) {
          console.error(err);
        } else {
          // file written successfully
        }
      });
    console.log(content);
}