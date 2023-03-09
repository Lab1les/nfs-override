//import
require('dotenv').config(); // load env variable
var fs = require('fs');

//const
const PATH_SPLITTER = "src";
const NFS_IMPORT_PATH = "@nfs/ecommerce-front-core/src/"
const OVERRIDE_DESTINATION = `ecommerce-front-${process.env.LOCALE}/src`

//vars
const corePath = process.argv[2];
const coreFileName = corePath.split("/").pop();
const itFileName = coreFileName.split(".").join(`.${process.env.LOCALE}.`);
const destinationPath = `${OVERRIDE_DESTINATION}${corePath.split(PATH_SPLITTER)[1].replace(coreFileName, itFileName)}`;
const overrideComment = process.argv[3];
const jiraTask = process.argv[4];
const jsonOverridePath = `${OVERRIDE_DESTINATION.split("/")[0]}/.migrate/override.json`;

const copyFile = async (corePath,destinationPath) =>  await fs.promises.cp(corePath, destinationPath,{recursive: true});
const getFileContent = async (path) => (await fs.promises.readFile(path)).toString();
const writeFileContent = async (path, content) => await fs.promises.writeFile(path, content);

// return JSON template for override.json
const newOverrideEntry = (corePath, overridedPath, overrideComment, jiraTask) => JSON.parse(
    `{
        "path": "${corePath}",
        "override": "${overridedPath}",
        "reasons": [
                {
                    "name": "${overrideComment}",
                    ${jiraTask ? `"jira": "${jiraTask}"` : ""}
                }
            ]
    }`);
    
// update override.json with new record    
const updateOverrideJson = async (jsonOverridePath,corePath,destinationPath,overrideComment,jiraTask) => {
    try{
        const newContent = JSON.parse(await getFileContent(jsonOverridePath));
        newContent.push(
            newOverrideEntry(
                `${PATH_SPLITTER}${corePath.split(PATH_SPLITTER)[1]}`,
                `${PATH_SPLITTER}${destinationPath.split(PATH_SPLITTER)[1]}`,
                overrideComment,
                jiraTask,
            )
        );
        await writeFileContent(jsonOverridePath, JSON.stringify(newContent));
        return true;
    }
    catch(e){
        console.error(e);
        return false;
    }
}

// update import and add override comment to copied file
const updateImportAndComment = async (destinationPath, overrideComment) =>{
    try{
        let fileContent = await getFileContent(destinationPath);
        let updatedFileContent = fileContent.toString()
            .replaceAll("from '@/", `from '${NFS_IMPORT_PATH}`) // set core import
            .replaceAll("from './", `from '${NFS_IMPORT_PATH}${corePath.split(PATH_SPLITTER)[1].replace(coreFileName, "")}`) // set relative import to core import
            .replaceAll("@import '.", `@import '${NFS_IMPORT_PATH}${corePath.split(PATH_SPLITTER)[1].replace(coreFileName, "")}`) // replace .less import
            .replace("<script>", addOvverideComment(overrideComment));
        await writeFileContent(destinationPath, updatedFileContent);
        return true;
    }
    catch(e){
        console.error(e);
        return false;
    }    
}   

// add override comment to file
const addOvverideComment = (overrideComment) => 
    `<script>
      /**
      * @Override
      * ${overrideComment}
    */`;

//start
(async () => {
    try{
        await copyFile(corePath, destinationPath); // copy file
        await updateImportAndComment(destinationPath, overrideComment); // update import and add override comment
        await updateOverrideJson( // add to override.json
            jsonOverridePath,
            corePath,
            destinationPath,
            overrideComment,
            jiraTask); 

        console.log("\x1b[42m", `succesfully overrided ${coreFileName}!`)
    }
    catch(e){
        console.error(e);
        return false;
    };
})();
