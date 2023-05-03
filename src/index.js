import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import  inquirerFileTreeSelection  from 'inquirer-file-tree-selection-prompt';
import mdToPrismic from './utils/mdToPrismic.js';
import Listr from 'listr';

inquirer.registerPrompt('file-tree-selection', inquirerFileTreeSelection);

const convertFiles = async (files) => {
  files.map(file => {
    fs.writeFileSync(`${file.replace(/\.[^.]*$/, '')}.json`, JSON.stringify(mdToPrismic(file), null, '  '), 'utf8');
    // console.log(chalk.green(`Coverted ${path.basename(file)} to ${path.basename(file).replace(/\.[^.]*$/, '')}.json`));
  })

}

export default async () => {

  const {pathToConvert} = await inquirer.prompt([
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
      }
    }
  ])

  const isDirectory = fs.lstatSync(pathToConvert).isDirectory();

  if (!isDirectory && path.extname(pathToConvert) !== '.md') {
    console.log(chalk.red('Only markdown files are supported'));;
    process.exit();
  }

  const files = isDirectory ? fs.readdirSync(pathToConvert).filter(file => path.extname(file) === '.md').map(file => `${pathToConvert}/${file}`) : [pathToConvert];

  if (files.length === 0) {
    console.log(chalk.red('No markdown files found in the directory'));;
    process.exit();
  }

  const tasks = new Listr([
    {
      title: `Converting ${files.length} file${files.length === 1 ? '' : 's'} to Pismic JSON`,
      task: () =>  convertFiles(files),
    }
  ]);

  await tasks.run();
  console.log(chalk.green(`Done converting ${files.length} file${files.length === 1 ? '' : 's'}`));
}
