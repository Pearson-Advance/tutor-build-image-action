const core = require('@actions/core');

const {
  parseBashArray,
  enablePlugins,
  prepareEnvironment,
  execInVenv,
  installTutorPlugins,
  getTutorRoot,
  getTutorConfigValue,
  installThemes,
  handlePrivatePackages,
  parseTutorConfigObject,
} = require('./util.js');

// Github action variables
const tutorVersion = core.getInput('tutor_version');
const tutorPearsonPluginBranch = core.getInput('tutor_pearson_plugin_branch');
const ghAccessToken = core.getInput('gh_access_token');
const tutorPluginSources = parseBashArray(core.getInput('tutor_plugin_sources'));
const tutorPluginsToEnable = parseBashArray(core.getInput('tutor_plugins_to_enable'));
const tutorPearsonPluginsToEnable = parseBashArray(core.getInput('tutor_pearson_plugins_to_enable'));
const themeRepository = core.getInput('theme_repository');
const themeBranch = core.getInput('theme_branch');

async function run() {
  try {
      await prepareEnvironment(
        tutorVersion,
        tutorPearsonPluginBranch,
        ghAccessToken,
      )
      await installTutorPlugins(tutorPluginSources);

      if (tutorPluginsToEnable) {
        core.info('Enabling Tutor plugins');
        await enablePlugins(tutorPluginsToEnable);
      }
      if (tutorPearsonPluginsToEnable) {
        core.info('Enabling Tutor Pearson plugins');
        await enablePlugins(tutorPearsonPluginsToEnable);
      }
      await execInVenv('tutor', ['config', 'save']);

      const tutorRoot = await getTutorRoot();
      const tutorConfigValue = await getTutorConfigValue("OPENEDX_PRIVATE_REQUIREMENTS");
      const extraPrivateRequirements = parseTutorConfigObject(tutorConfigValue);

      if (extraPrivateRequirements) {
        await handlePrivatePackages(
          extraPrivateRequirements,
          ghAccessToken,
          tutorRoot,
        );
      }
      await installThemes(
        themeRepository,
        themeBranch,
        tutorRoot,
      )
  }
  catch(error) {
      console.log(error.message);
      core.setFailed(error.message);
  }
}

run();
