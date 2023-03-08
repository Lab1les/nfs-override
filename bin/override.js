//import
require('dotenv').config(); // load env variable
var fs = require('fs');

//const
const PATH_SPLITTER = "src";
const RED_LOG = "\x1b[41m";
const GREEN_LOG = "\x1b[42m";
const NFS_IMPORT_PATH = "@nfs/ecommerce-front-core/src/"

//vars
const corePath = process.argv[2];
const coreFileName = corePath.split("/").pop();
const itFileName = coreFileName.split(".").join(`.${process.env.LOCALE}.`);
const destinationPath = `${process.env.OVERRIDE_DESTINATION}${corePath.split(PATH_SPLITTER)[1].replace(coreFileName, itFileName)}`;
const overrideComment = process.argv[3];
const jiraTask = process.argv[4];

// add override to override.json
const overrideJson = async () => {
    const overrideTemplate = () => {
        try {
            return JSON.parse(
                `{
                    "path": "${PATH_SPLITTER}${corePath.split(PATH_SPLITTER)[1]}",
                    "override": "${PATH_SPLITTER}${destinationPath.split(PATH_SPLITTER)[1]}",
                    "reasons": [
                            {
                                "name": "${overrideComment}",
                                ${jiraTask ? `"jira": "${jiraTask}"` : ""}
                            }
                        ]
                }`)
        } catch (error) {
            return error
        }
    
    };
    const jsonOverridePath = `${process.env.OVERRIDE_DESTINATION.split("/")[0]}/.migrate/override.json`;
    try{
        const jsonOverrideContent = await fs.promises.readFile(jsonOverridePath);
        const jsonOverride = JSON.parse(jsonOverrideContent.toString());
        jsonOverride.push(overrideTemplate());
        await fs.promises.writeFile(jsonOverridePath, JSON.stringify(jsonOverride));
        return true;
    }
    catch(e){
        console.log(e);
        return false;
    }
}

// update import to copied file
const updateImport = async (overridedFile) =>{
    try{
        let fileContent = await fs.promises.readFile(overridedFile);
        let result = fileContent.toString()
        .replaceAll("from '@/", `from '${NFS_IMPORT_PATH}`) // set core import
        .replaceAll("from './", `from '${NFS_IMPORT_PATH}${corePath.split(PATH_SPLITTER)[1].replace(coreFileName, "")}`) // set relative import to core import
        .replaceAll("@import '.", `@import '${NFS_IMPORT_PATH}${corePath.split(PATH_SPLITTER)[1].replace(coreFileName, "")}`) // replace .less import
        await fs.promises.writeFile(overridedFile, result);
        return true;
    }
    catch(e){
        console.log(e);
        return false;
    }    
}   

// add override comment to file
const addOvverideComment = async (overridedFile) => {
    // TODO
}

//start
(async () => {
    try{
        await fs.promises.cp(corePath, destinationPath,{recursive: true}); // copy file
        await updateImport(destinationPath); // update import to copied file
        await overrideJson(); // add to override.json
    }
    catch(e){
        console.log(e);
        return false;
    };
})();
