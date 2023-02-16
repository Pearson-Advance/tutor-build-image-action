const core = require('@actions/core');
const exec = require('@actions/exec');

const fs = require('fs');
const path = require('path');
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
 * @param  {Object} execOptions - Additional options for exec command.
 */
async function enablePlugins(pluginsToEnable, execOptions) {
    if (!pluginsToEnable || pluginsToEnable.length === 0) {
      core.info('No plugins provided to enable. Skipping.');
      return;
    }
    if (!Array.isArray(pluginsToEnable)) {
      throw new Error('pluginsToEnable is not an array.');
    }

    for (const plugin of pluginsToEnable) {
      core.info(`Enabling ${plugin}`);
      await execInVenv("tutor", ["plugins", "enable", plugin], execOptions);
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
 * @param {Object} options - Exec options like shell, listeners etc.
 * @throws Will throw an error if any step in the environment preparation fails.
 * @example ->  await prepareEnvironment('3.12.0', 'https://example.com/pluginUrl', 'myGithubToken', options);
 */
async function prepareEnvironment(tutorVersion, tutorPearsonPluginBranch = 'main', ghAccessToken, options) {
    try {
      // Create and activate virtualenv
      await exec.exec('python3', ['-m', 'venv', 'venv'], options);
      await execInVenv('pip', ['install', `tutor==${tutorVersion}`], options);
      await execInVenv('pip', ['install', '-e', `git+https://${ghAccessToken}@github.com/Pearson-Advance/tutor-pearson-plugin.git@${tutorPearsonPluginBranch}#egg=tutor-pearson-plugin`], options)
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
 * @param {Array<string>} args - The list of arguments for the command.
 * @param {Object} options
 * @throws Will throw an error if the command fails to execute.
 * @example -> execInVenv('pip', ['-m','install', 'package_name']);
 */
async function execInVenv(command, args, options) {
    await exec.exec(`venv/bin/${command}`, args, options);
}

/**
 * Installs Tutor plugins from provided sources if any.
 * @async
 * @param {Array<string>} tutorPluginSources - An array of Tutor plugin source URLs or package names.
 * @throws {Error} Throws an error if installation of any plugin fails.
 * @returns {void} Returns nothing; side effect is the installation of plugins.
 */
async function installTutorPlugins(tutorPluginSources, options) {
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
            options,
          );
          core.info(`Successfully installed plugin ${sourceUrl}.`);
      } catch (error) {
          throw new Error(`Plugin installation failed for ${sourceUrl}. Error: ${error.message}.`);
      }
    }
    core.info("Plugins succesfully installed.");
}

/**
 * Retrieves the root directory where Tutor is installed
 * @async
 * @throws Will throw an error if it fails to retrieve the Tutor root directory, or if the directory does not exist.
 * @returns {Promise<string>} A promise that resolves to the Tutor root directory path as a string.
 * @example -> const tutorRoot = await getTutorRoot();
 */
async function getTutorRoot() {
    let tutorRoot = '';
    const tutor_root_options = {
        shell: '/bin/bash',
        listeners: {
          stdout: (data) => {
            tutorRoot += data.toString();
          },
          stderr: (data) => {
            throw new Error(`Error retrieving tutor root: ${data.toString()}`);
          },
        },
    };
    
    await execInVenv('tutor', ['config', 'printroot'], tutor_root_options);
    tutorRoot = tutorRoot.trim();
  
    // Validate tutor root path
    if (!tutorRoot) {
      throw new Error(`The tutor root path does not exist.`);
    }
  
    return tutorRoot;
}

/**
 * Installs themes for Open edX from a given GitHub repository and branch.
 * @async
 * @param {string} themeRepository - The GitHub URL of the theme repository.
 * @param {string} themeBranch - The branch to clone from the theme repository.
 * @param {string} tutorRoot - The root directory where Tutor is installed.
 * @param {object} options - Additional options for the `exec` method.
 * 
 * @throws Will throw an error if the installation process fails.
 * 
 * @example -> await installThemes('https://github.com/example/repo.git', 'main', '/path/to/tutor/root', options);
 */
async function installThemes(themeRepository, themeBranch, tutorRoot, options) {
    if (!themeRepository || themeRepository === 'false' || !themeBranch || !tutorRoot) {
      core.info('Skipping theme installation due to insufficient parameters.');
      return;
    }
  
    const themesPath = `${tutorRoot}/env/build/openedx/themes/`;
  
    try {
        core.info(`Starting theme installation from repository: ${themeRepository} and branch: ${themeBranch}`);
      
        // Clone the repository and check if it was successful
        const cloneResult = await exec.exec('git', ['clone', '-b', themeBranch, themeRepository], options);
        if (cloneResult !== 0) {
          throw new Error("Failed to clone the theme repository.");
        }
        
        // Check if the destination directories exist
        if (!fs.existsSync(themesPath)) {
          throw new Error(`Themes directory ${themesPath} doesn't exist.`);
        }
      
        moveAll('openedx-themes/edx-platform/', themesPath);
      
        core.info('Themes installation completed successfully.');
      } catch (error) {
        throw new Error(`Failed to install themes. Error: ${error.message}`);
      }
}


/**
 * Clones a GitHub repository to a specified directory.
 * @async
 * @param {string} repository - The name of the repository to clone.
 * @param {string|null} branch - The specific branch to clone. If null, the default branch will be cloned.
 * @param {string} targetDir - The directory where the repository should be cloned.
 * @param {Object} options - Additional options passed to the exec command.
 * @param {string} ghAccessToken - GitHub access token for authentication.
 * @throws Will throw an error if the execution fails.
 * @example -> await gitClone('myRepo', 'main', './targetDir', {}, 'ghAccessToken');
 */
async function gitClone(repositoryName, branch, targetDir, options, ghAccessToken="" ) {
    try {
        const branchOption = branch ? ['-b', branch] : [];
        const authPart = ghAccessToken ? `${ghAccessToken}@` : '';
        const repoUrl = `https://${authPart}github.com/Pearson-Advance/${repositoryName}.git`;

        await exec.exec(
            'git',
            [
                'clone',
                ...branchOption,
                repoUrl,
                targetDir,
            ],
            options
        );
    } catch (error) {
        throw new Error(`Failed to clone repository: ${error.message}`);
    }
}
  
/**
 * Handles the cloning and requirements setup for private repositories.
 * @async
 * @param {Array} privateRepositories - An array containing the names of the private repositories to be cloned.
 * @param {Array} branches - An array containing the branches to be cloned from each repository.
 * @param {string} ghAccessToken - GitHub access token to authenticate for private repository cloning.
 * @param {string} tutorRoot - The root directory path where the cloned repositories will be placed.
 * @param {Object} options - Execution options for shell commands.
 */
async function handlePrivatePackages(privateRepositories, branches, ghAccessToken, tutorRoot, options) {
    core.info("Handling private packages...");
    if (!Array.isArray(privateRepositories) || privateRepositories.length === 0) {
        core.warning('No private repositories provided.');
        return;
    }
    if (!Array.isArray(branches) || branches.length !== privateRepositories.length) {
        core.error('Mismatch between number of repositories and number of branches.');
        throw new Error('Branches and repositories array lengths must match.');
    }
    
    const privateTxtPath = `${tutorRoot}/env/build/openedx/requirements/private.txt`;
    const requirements = [];
    const repoBranchPairs = privateRepositories.map((repository, index) => ({
      repository,
      branch: branches[index]
    }));

    for (const { repository, branch } of repoBranchPairs) {
      const targetDir = `${tutorRoot}/env/build/openedx/requirements/${repository}`;
      await gitClone(repository, branch, targetDir, options, ghAccessToken);
      requirements.push(`-e ./${repository}`);
    }

    try {
        fs.appendFileSync(privateTxtPath, `${requirements.join('\n')}\n`);
    } catch (error) {
        core.error(`Failed to write to ${privateTxtPath}`);
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
  installThemes, 
  handlePrivatePackages, 
};
