const core = require('@actions/core');
const exec = require('@actions/exec');


const { parseBashArray, enablePlugins, prepareEnvironment, execInVenv, installTutorPlugins, getTutorRoot, installThemes, handlePrivatePackages } = require('./util.js');

// Standard out and standard error will be written to these variables
var myOutput = "";
var myError = "";
const options = {
  shell: '/bin/bash',
  listeners: {
    stdout: (data) => {
      myOutput += data.toString();
    },
    stderr: (data) => {
      myError += data.toString();
    }
  }
};

const tutorVersion = core.getInput('tutor_version');
const tutorPearsonPluginBranch = core.getInput('tutor_pearson_plugin_branch');
const ghAccessToken = core.getInput('gh_access_token');
const tutorPearsonPluginsToEnable = parseBashArray(core.getInput('tutor_pearson_plugins_to_enable'));
const tutorPluginsToEnable = parseBashArray(core.getInput('tutor_plugins_to_enable'));
const additionalPluginSources = parseBashArray(core.getInput('tutor_additional_plugin_sources'));
const extraPrivateRequirements = core.getBooleanInput('extra_private_requirements');
const privateRepositories = parseBashArray(core.getInput('private_repositories'));
const privateRepositoriesBranches = parseBashArray(core.getInput('private_repositories_branches'));
const themeRepository  = core.getInput('theme_repository');
const themeBranch  = core.getInput('theme_branch');

async function run() {
  try {
      
      // create venv, install Tutor, install Tutor Pearson Plugin
      await prepareEnvironment(tutorVersion, tutorPearsonPluginBranch, ghAccessToken, options);
      
      await installTutorPlugins(additionalPluginSources);

      const tutorRoot = await getTutorRoot();
      core.info(`tutorRoot: ${tutorRoot}`);
      
      if (extraPrivateRequirements) {
        await handlePrivatePackages(privateRepositories, privateRepositoriesBranches, ghAccessToken, tutorRoot, options);
      }

      if (tutorPearsonPluginsToEnable) {
        core.info('Enabling Tutor Pearson plugins (According to service and environment).');
        await enablePlugins(tutorPearsonPluginsToEnable, options);
      }
      if (tutorPluginsToEnable) {
        core.info('Enabling Tutor plugins (for all services and environments).');
        await enablePlugins(tutorPluginsToEnable, options);
      }

      await execInVenv('tutor', ['config', 'save'], options);

      await installThemes(themeRepository, themeBranch, tutorRoot, options);
  }
  catch(error) {
      console.log(myOutput);
      console.log(myError);
      console.log(error.message);
      core.setFailed(myError);
  }

}

run();
