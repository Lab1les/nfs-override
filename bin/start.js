#! /usr/bin/env node
const { exec } = require("child_process");
var readline = require('readline');

var rl = readline.createInterface(process.stdin, process.stdout);

const ask = async () => {
    let corePath = await new Promise(resolve => {rl.question("Insert core component path: ", input => resolve(input))});
    let overrideComment = await new Promise(resolve => {rl.question("Insert override comment: ", input => resolve(input))});

    //good input
    if(corePath && overrideComment){
        rl.close();
        exec(`node ${__dirname}/override.js "${corePath}" "${overrideComment}"`, (e, stdout, stderr) => {
            if (e) return false;
            if (stderr) return false;
            console.log(stdout);
        });
        return true;
    }
    // wrong input
    console.log("You must provide valid path and comment");
    rl.close();
    return false;
}

ask();