const core = require('@actions/core');
const exec = require('@actions/exec');

const fs = require('fs');
const path = require('path');

// Standard out and standard error
let stdout = '';
let stderr = '';
const execOptions = {
  shell: '/bin/bash',
  listeners: {
    stdout: (data) => {
      stdout += data.toString();
    },
    stderr: (data) => {
      stderr += data.toString();
    },
  },
};

/**
 * Parses a string containing an array of strings in the bash syntax.
 * @param  {String} arr Bash array as a string. Example: ("abc" "def")
 * @return {Object}     Parsed array.
 */
function parseBashArray(strBashArray) {
  if (!strBashArray) {
    throw new Error('Input array is null or undefined.');
  }
  if (strBashArray === "()" || strBashArray === "'()'" || strBashArray === "false") {
    return [];
  }
  if (strBashArray[0] === "'" && strBashArray[strBashArray.length - 1] === "'") {
    strBashArray = strBashArray.slice(1, -1);
  }
  if (strBashArray[0] !== "(" || strBashArray[strBashArray.length - 1] !== ")") {
    throw new Error(`Input array '${strBashArray}' does not have valid enclosing parentheses.`);
  }
  
  const elements = strBashArray.slice(1, -1).split(" ");
  const parsedArray = elements.map(element => element.slice(1, -1));
  return parsedArray;
}

/**
 * Receives an array of strings with tutor plugin names and enables them.
 * @param  {Array} pluginsToEnable - Bash array as a string. Example: ["abc", "def"]
 */
async function enablePlugins(pluginsToEnable) {
    if (!pluginsToEnable || pluginsToEnable.length === 0) {
      core.info('No plugins provided to enable. Skipping.');
      return;
    }
    if (!Array.isArray(pluginsToEnable)) {
      throw new Error('pluginsToEnable is not an array.');
    }

    for (const plugin of pluginsToEnable) {
      core.info(`Enabling ${plugin}`);
      await execInVenv('tutor', ['plugins', 'enable', plugin]);
    }
}

/**
 * Moves all contents from one path to another.
 * @param  {String} oldPath - Origin path
 * @param  {String} newPath - Target path
 */
function moveAll(oldPath, newPath) {
    if (!fs.existsSync(oldPath)) {
        core.info(`Path ${oldPath} was not found.`);
        return;
    }
    if (!fs.existsSync(newPath)) {
        core.info(`Path ${newPath} was not found.`);
        return;
    }

    const toMove = fs.readdirSync(oldPath);

    for (const dir of toMove) {
      fs.renameSync(`${oldPath}${dir}`, `${newPath}${dir}`);
    }
}

/**
 * This function performs the following steps:
 * 1. Creates a Python virtual environment.
 * 2. Installs the specified version of Tutor.
 * 3. Installs Tutor Pearson Plugin.
 * @async
 * @param {string} tutorVersion - The version of Tutor to install.
 * @param {string} tutorPearsonPluginBranch - The branch of the Pearson plugin for Tutor.
 * @param {string} ghAccessToken - The GitHub access token for private repositories or installations.
 * @throws Will throw an error if any step in the environment preparation fails.
 * @example ->  await prepareEnvironment('3.12.0', 'https://example.com/pluginUrl', 'myGithubToken', options);
 */
async function prepareEnvironment(tutorVersion, tutorPearsonPluginBranch = 'main', ghAccessToken) {
    try {
      // Create and activate virtualenv
      await exec.exec('python3', ['-m', 'venv', 'venv'], execOptions);
      await execInVenv('pip', ['install', `tutor==${tutorVersion}`]);
      await execInVenv('pip', ['install', '-e', `git+https://${ghAccessToken}@github.com/Pearson-Advance/tutor-pearson-plugin.git@${tutorPearsonPluginBranch}#egg=tutor-pearson-plugin`])
      core.info('Succesfully installed Tutor Pearson Plugin');
    } catch (error) {
      core.error(`Environment preparation failed: ${error.message}`);
      throw error;
    }
}

/**
 * Executes a given command within a Python virtual environment.
 * @async
 * @param {string} command - The command to execute.
 * @param {Array<string>} args - A list of arguments for the command.
 * @example -> execInVenv('pip', ['-m','install', 'package_name']);
 */
async function execInVenv(command, args) {
    await exec.exec(`venv/bin/${command}`, args, execOptions);
}

/**
 * Installs Tutor plugins from provided sources if any.
 * @async
 * @param {Array<string>} tutorPluginSources - An array of Tutor plugin source URLs or package names.
 * @throws {Error} Throws an error if installation of any plugin fails.
 * @returns {void} Returns nothing; side effect is the installation of plugins.
 */
async function installTutorPlugins(tutorPluginSources) {
    if (!Array.isArray(tutorPluginSources) || tutorPluginSources.length === 0) {
      core.warning('No valid Tutor plugin sources provided. Skipping plugin installation.');
      return;
    }

    core.info('Installing Tutor plugins.');
    for (const sourceUrl of tutorPluginSources) {
      try {
          core.info(`Attempting to install ${sourceUrl}...`);
          await execInVenv(
            'pip', 
            sourceUrl.startsWith('git+') ? ['install', '-e', sourceUrl] : ['install', sourceUrl],
          );
          core.info(`Successfully installed plugin ${sourceUrl}.`);
      } catch (error) {
          throw new Error(`Plugin installation failed for ${sourceUrl}. Error: ${error.message}.`);
      }
    }
    core.info('Plugins succesfully installed.');
}

/**
 * Retrieves the root directory where Tutor is installed
 * @async
 * @throws Will throw an error if it fails to retrieve the Tutor root directory, or if the directory does not exist.
 * @returns {Promise<string>} A promise that resolves to the Tutor root directory path as a string.
 * @example -> const tutorRoot = await getTutorRoot();
 */
async function getTutorRoot() {
    try{
      myout = '';
      await execInVenv('tutor', ['config', 'printroot']);
      const tutorRoot = stdout.trim();

      // Validate tutor root path
      if (!tutorRoot) {
        throw new Error(`The tutor root path does not exist.`);
      }
      return tutorRoot;
    } catch(error){
      throw error;
    }
}

/**
 * Converts a string representation of an object into a JavaScript object.
 * @param {string} strObject - The string representation of the object.
 * @throws Will throw an error if the string cannot be parsed into a JavaScript object.
 * @returns {Object} The JavaScript object parsed from the provided string.
 * @example -> parseTutorConfigObject('{'myKey': 'myValue'}');
 */
function parseTutorConfigObject(strObject){
  if (strObject == '{}'){ return {} };
  if (typeof strObject !== 'string'){ throw new Error('Input must be a string.') };
  if (strObject === '') { throw new Error('Input string cannot be empty') };

  try {
    const jsonString = strObject.replace(/'/g, '"');
    return JSON.parse(jsonString);
  }
  catch(error) {
    throw error;
  }
}

/**
 * Obtains a specific Tutor configuration value.
 * @async
 * @param {string} key - The key of the configuration value to obtain.
 * @throws Will throw an error if no key is provided or if an error occurs while obtaining the configuration value.
 * @returns {string} The configuration value corresponding to the provided key.
 * @example -> await getTutorConfigValue('myKey');
 */
async function getTutorConfigValue(key) {
  if (!key) {
    throw new Error('You have to provide a KEY to obtain a tutor config value.');
  }
  try {
    stdout = '';
    await execInVenv('tutor', ['config', 'printvalue', key]);
    return stdout.trim();
  } catch(error) {
    throw error;
  }
}

/**
 * Installs themes for Open edX from a given GitHub repository and branch.
 * @async
 * @param {string} themeRepository - The GitHub URL of the theme repository.
 * @param {string} themeBranch - The branch to clone from the theme repository.
 * @param {string} tutorRoot - The root directory where Tutor is installed.
 * 
 * @throws Will throw an error if the installation process fails.
 * 
 * @example -> await installThemes('https://github.com/example/repo.git', 'main', '/path/to/tutor/root');
 */
async function installThemes(themeRepository, themeBranch, tutorRoot) {
    if (!themeRepository || themeRepository === 'false' || !themeBranch || !tutorRoot) {
      core.info('Skipping theme installation due to insufficient parameters.');
      return;
    }

    const themesPath = `${tutorRoot}/env/build/openedx/themes/`;

    try { 
          // Clone 
          const cloneResult = await exec.exec(
            'git', 
            ['clone', '-b', themeBranch, themeRepository], 
            execOptions,
          )
          
          // Validate cloning and themes path existance
          if (cloneResult !== 0) {
            throw new Error('Failed to clone the theme repository.');
          }          
          if (!fs.existsSync(themesPath)) {
            throw new Error(`Themes directory ${themesPath} doesn't exist.`);
          }

          // Move openedx themes inside the Tutor themes path
          moveAll('openedx-themes/edx-platform/', themesPath);
          core.info('Themes installation completed successfully.');

      } catch (error) {
        throw error;
      }
}

/**
 * Clones a Pearson-Advance GitHub repository to a specified directory.
 * @async
 * @param {string} repositoryName - The name of the repository to clone.
 * @param {string|null} branch - The specific branch to clone. If null, the default branch will be cloned.
 * @param {string} targetDir - The directory where the repository should be cloned.
 * @param {string} ghAccessToken - GitHub access token for authentication.
 * @throws Will throw an error if the execution fails.
 * @example -> await gitClone('myRepo', 'main', './targetDir', 'ghAccessToken');
 */
async function gitClone(repositoryName, branch, targetDir, ghAccessToken='' ) {
    try {
        const branchOption = branch ? ['-b', branch] : [];
        const auth = ghAccessToken ? `${ghAccessToken}@` : '';
        const repoUrl = `https://${auth}github.com/Pearson-Advance/${repositoryName}.git`;

        await exec.exec(
            'git',
            [
                'clone',
                ...branchOption,
                repoUrl,
                targetDir,
            ],
            execOptions,
        );
    } catch (error) {
        throw new Error(`Failed to clone repository: ${error.message}`);
    }
}

/**
 * Handles the cloning and requirements setup for private repositories.
 * @async
 * @param {Object} privateRequirements - An Object containing the Pearson-Advance repositories names and their respective branches to be cloned.
 * @param {string} ghAccessToken - GitHub access token to authenticate for private repository cloning.
 * @param {string} tutorRoot - The root directory path where the cloned repositories will be placed.
 * @throws Will throw an if the execution fails.
 */
async function handlePrivatePackages(privateRequirements, ghAccessToken, tutorRoot) {
    core.info('Handling private packages...');

    const privateTxtPath = `${tutorRoot}/env/build/openedx/requirements/private.txt`;
    const requirements = [];
    try {
        // Clone private repositories into Tutor private requirements directory
        for (const [repository, branch] of Object.entries(privateRequirements)) {
          const targetDir = `${tutorRoot}/env/build/openedx/requirements/${repository}`;
          await gitClone(repository, branch, targetDir, ghAccessToken);
          requirements.push(`-e ./${repository}`);
        }

        // Write every private requirement to the private.txt
        fs.appendFileSync(privateTxtPath, `${requirements.join('\n')}\n`);
    } catch (error) {
        core.error(error.message);
        throw error;
    }
}

module.exports = {
  parseBashArray,
  enablePlugins,
  moveAll,
  prepareEnvironment,
  execInVenv,
  installTutorPlugins,
  getTutorRoot,
  getTutorConfigValue,
  installThemes,
  handlePrivatePackages,
  parseTutorConfigObject,
};
