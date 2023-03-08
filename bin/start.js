#! /usr/bin/env node
const { exec } = require("child_process");
var readline = require('readline');

const RED_LOG = "\x1b[41m";

var rl = readline.createInterface(process.stdin, process.stdout);

(async () => {
    let corePath = await new Promise(resolve => {rl.question("Insert core component path: ", input => resolve(input))});
    let overrideComment = await new Promise(resolve => {rl.question("Insert override comment: ", input => resolve(input))});
    let jiraTask = await new Promise(resolve => {rl.question("Insert jira task: ", input => resolve(input))});
    
    //good input
    if(corePath && overrideComment){
        rl.close();
        exec(`node ${__dirname}/override.js "${corePath}" "${overrideComment}" "${jiraTask}"`, (e, stdout, stderr) => {
            if (e) return false;
            if (stderr) return false;
            console.log(stdout);
        });
        return true;
    }
    
    // wrong input
    console.log(RED_LOG, "You must provide valid path and comment");
    rl.close();
    return false;
})()