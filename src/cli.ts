import chalk from 'chalk';
import fs from 'fs';
import JSZip from 'jszip';
import path from 'path';
import inquirer from 'inquirer';
import inquirerFileTreeSelection from 'inquirer-file-tree-selection-prompt';
import mdToPrismic from './utils/mdToPrismic.js';
import Listr from 'listr';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import {convertFilesOptions, filesToZipOptions} from "./types.js";

inquirer.registerPrompt('file-tree-selection', inquirerFileTreeSelection);

const convertFiles = async (files: Array<string>, options: convertFilesOptions) => {
    const {fieldName, sliceName, sliceVariation, outputAs} = options || {};
    files.map((file: string) => {
        const content = fs.readFileSync(file, 'utf8');
        const fileContents = mdToPrismic(content, {fileName: path.basename(file), fieldName, sliceName, sliceVariation, outputAs});
        if (!fileContents) {
            console.log(chalk.red(`${path.basename(file)} skipped`));
            return;
        }
        fs.writeFileSync(`${file.replace(/\.[^.]*$/, '')}.json`, JSON.stringify(fileContents, null, '  '), 'utf8');
    })
}

const filesToZip = async (files: Array<string>, options: filesToZipOptions) => {
    const {pathToWriteTo, fieldName, sliceName, sliceVariation, outputAs} = options || {};
    const zip = new JSZip();
    const filesAddedToZip = files.map(file => {
        const content = fs.readFileSync(file, 'utf8');
        const fileContents = mdToPrismic(content, {fileName: path.basename(file), fieldName, sliceName, sliceVariation, outputAs});
        if (!fileContents) {
            console.log(chalk.red(`${path.basename(file)} skipped`));
            return;
        }
        zip.file(`${path.basename(file).replace(/\.[^.]*$/, '')}.json`, JSON.stringify(fileContents, null, '  '));
    });

    // @ts-ignore
    if (filesAddedToZip.some((file) => file === false)) {
        console.log(chalk.red('No files added to zip'));
        return;
    }

    zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
        .pipe(fs.createWriteStream(`${pathToWriteTo}/prismic-import.zip`));
}

export default async () => {

    // @ts-ignore
    const { pathToConvert: pathToConvertCli, fieldName: fieldNameCli, sliceName: sliceNameCli, sliceVariation: sliceVariationCli, outputAs: outputAsCli } = yargs(hideBin(process.argv))
        .option('pathToConvert', {
            alias: 'p',
            type: 'string',
            description: 'Path of the file or folder to convert',
            default: null,
        })
        .option('outputAs', {
            alias: 'o',
            type: 'string',
            description: 'Output the rich text as a slice or field.',
            choices: ['slice', 'field'],
        })
        .option('fieldName', {
            alias: 'f',
            type: 'string',
            description: 'ID of the field to output the richt text in.',
            default: null,
        })
        .option('sliceName', {
            alias: 's',
            type: 'string',
            description: 'ID of the slice to output the richt text in.',
            default: null,
        })
        .option('sliceVariation', {
            alias: 'v',
            type: 'string',
            description: 'Variation of the slice to output the richt text in.',
            default: 'default',
        })
        .parse();

    if (outputAsCli === 'slice') {
        const missingConfig = [];
        if (!sliceNameCli) {
            missingConfig.push('sliceName');
        }

        if (missingConfig.length > 0) {
            console.log(chalk.red(`missing arguments ${missingConfig.join(', ')} `));
            return;
        }
    }

    const { pathToConvert = pathToConvertCli, fieldName = fieldNameCli, sliceName = sliceNameCli, sliceVariation = sliceVariationCli, outputAs = outputAsCli } = await inquirer.prompt([
        {
            type: 'file-tree-selection',
            name: 'pathToConvert',
            message: 'Select a file or directory to convert',
            enableGoUpperDirectory: true,
            onlyShowValid: true,
            validate: (item) => {
                const name = item.split(path.sep).pop();
                if (name[0] === ".") {
                    return "please select another file"
                }
                return true;
            },
            transformer: (input) => {
                const name = input.split(path.sep).pop();
                if (name[0] === ".") {
                    return chalk.grey(name);
                }
                return name;
            },
            when: () => !pathToConvertCli,
        },
        {
            type: 'list',
            name: 'outputAs',
            message: 'Where do you want the content to go?',
            choices: ['field', 'slice'],
            default: 'field',
            when: () => !outputAsCli,
        },
        {
            type: 'input',
            name: 'fieldName',
            message: 'What is the id of the rich text field?',
            when(answers) {
                return (answers.outputAs === 'field' || outputAsCli === 'field') && !fieldNameCli;
            },
        },
        {
            type: 'input',
            name: 'sliceName',
            message: 'What is the id of the slice?',
            when(answers) {
                return (answers.outputAs === 'slice' || outputAsCli === 'slice') && !sliceNameCli;
            },
        },
        {
            type: 'input',
            name: 'sliceVariation',
            message: 'What is the variation of the slice?',
            default: 'default',
            when(answers) {
                return (answers.outputAs === 'slice' || outputAsCli === 'slice') && !sliceVariationCli;
            },
        },
        {
            type: 'input',
            name: 'fieldName',
            message: 'What is the id of the rich text field in the slice?',
            when(answers) {
                return (answers.outputAs === 'slice' || outputAsCli === 'slice') && !fieldNameCli;
            },
        }
    ]);

    const isDirectory = fs.lstatSync(pathToConvert).isDirectory();

    if (!isDirectory && path.extname(pathToConvert) !== '.md') {
        console.log(chalk.red('Only markdown files are supported'));;
        process.exit();
    }

    const files = isDirectory ?
        fs.readdirSync(pathToConvert).filter(file => path.extname(file) === '.md').map(file => `${pathToConvert}/${file}`)
        : [pathToConvert];

    if (files.length === 0) {
        console.log(chalk.red('No markdown files found in the directory'));;
        process.exit();
    }

    const tasks = new Listr([
        {
            title: `Converting ${files.length} file${files.length === 1 ? '' : 's'} to Pismic JSON`,
            enabled: () => !isDirectory,
            task: () =>  convertFiles(files, {pathToConvert, fieldName, sliceName, sliceVariation, outputAs}),
        },
        {
            title: `Converting ${files.length} file${files.length === 1 ? '' : 's'} to Pismic JSON into a zip file`,
            enabled: () => isDirectory,
            task: () =>  filesToZip(files, {pathToWriteTo: pathToConvert, fieldName, sliceName, sliceVariation, outputAs}),
        }
    ]);

    await tasks.run();
    console.log(chalk.green(`Done converting ${files.length} file${files.length === 1 ? '' : 's'}`));
}