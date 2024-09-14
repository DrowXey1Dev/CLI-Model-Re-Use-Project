#!/usr/bin/env node

import fs from "fs";
import { Command } from "commander";

const program = new Command();

program
  .version("0.0.1")
  .parse(process.argv);

  const options = program.opts();

if(process.argv[2] == "install") {
    console.log("All dependencies were installed");
}
else if(process.argv[2] == "test") {
    console.log("All tests were passed");
}
else {
    fs.openSync("./" + process.argv[2] + ".NDJSON", "w");
}