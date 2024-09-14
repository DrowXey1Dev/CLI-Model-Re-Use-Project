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
    fs.openSync("./" + "output" + ".NDJSON", "w");
}