const core = require('@actions/core');

const {
  parseBashArray,
  enablePlugins,
  prepareEnvironment,
  execInVenv,
  installTutorPlugins,
  getTutorRoot,
  installThemes,
  handlePrivatePackages,
} = require('./util.js');

// Standard out and standard error will be written to these variables
let myOutput = '';
let myError = '';
const execOptions = {
  shell: '/bin/bash',
  listeners: {
    stdout: (data) => {
      myOutput += data.toString();
    },
    stderr: (data) => {
      myError += data.toString();
    },
  },
};

const tutorVersion = core.getInput('tutor_version');
const tutorPearsonPluginBranch = core.getInput('tutor_pearson_plugin_branch');
const ghAccessToken = core.getInput('gh_access_token');
const tutorPluginSources = parseBashArray(core.getInput('tutor_plugin_sources'));
const extraPrivateRequirements = core.getBooleanInput('extra_private_requirements');
const privateRepositories = parseBashArray(core.getInput('private_repositories'));
const privateRepositoriesBranches = parseBashArray(core.getInput('private_repositories_branches'));
const tutorPluginsToEnable = parseBashArray(core.getInput('tutor_plugins_to_enable'));
const tutorPearsonPluginsToEnable = parseBashArray(core.getInput('tutor_pearson_plugins_to_enable'));
const themeRepository = core.getInput('theme_repository');
const themeBranch = core.getInput('theme_branch');

async function run() {
  try {
      await prepareEnvironment(tutorVersion, tutorPearsonPluginBranch, ghAccessToken, execOptions);
      await installTutorPlugins(tutorPluginSources,execOptions);
      
      const tutorRoot = await getTutorRoot();
      if (extraPrivateRequirements) {
        await handlePrivatePackages(privateRepositories, privateRepositoriesBranches, ghAccessToken, tutorRoot, execOptions);
      }
      if (tutorPluginsToEnable) {
        core.info('Enabling Tutor plugins (for all services and environments).');
        await enablePlugins(tutorPluginsToEnable, execOptions);
      }
      if (tutorPearsonPluginsToEnable) {
        core.info('Enabling Tutor Pearson plugins (According to service and environment).');
        await enablePlugins(tutorPearsonPluginsToEnable, execOptions);
      }
      await execInVenv('tutor', ['config', 'save'], execOptions);
      await installThemes(themeRepository, themeBranch, tutorRoot, execOptions);
  }
  catch(error) {
      console.log(myOutput);
      console.log(myError);
      console.log(error.message);
      core.setFailed(myError);
  }

}

run();
