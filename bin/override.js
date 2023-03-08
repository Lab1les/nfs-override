const fs = require('fs');

const filePath = process.env.npm_config_filePath // file path;

if(filePath){
    console.log(filePath);
    return;
}
console.log("no file path");