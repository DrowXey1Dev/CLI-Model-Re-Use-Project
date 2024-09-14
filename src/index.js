#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("module").createRequire()
var commander_1 = require("commander");
var program = new commander_1.Command();
program.action(function () {
    console.log("Hello!");
});
/* Execute the CLI with the given arguments. */
program.parse(process.argv);
