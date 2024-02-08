const core = require('@actions/core');

const {
  execInVenv,
  getTutorRoot,
  installThemes,
  enablePlugins,
  parseBashArray,
  prepareEnvironment,
  installTutorPlugins,
  getTutorConfigValue,
  handlePrivatePackages,
  parseTutorConfigObject,
} = require('./utils.js');

// Github action variables
const tutorVersion = core.getInput('tutor_version');
const tutorPearsonPluginBranch = core.getInput(
    'tutor_pearson_plugin_branch',
);
const ghAccessToken = core.getInput('gh_access_token');
const tutorPluginSources = parseBashArray(
    core.getInput('tutor_plugin_sources'),
);
const tutorPluginsToEnable = parseBashArray(
    core.getInput('tutor_plugins_to_enable'),
);
const tutorPearsonPluginsToEnable = parseBashArray(
    core.getInput('tutor_pearson_plugins_to_enable'),

);
const extraPrivateRequirements = core.getBooleanInput(
    'extra_private_requirements',
);
const themeRepository = core.getInput('theme_repository');
const themeBranch = core.getInput('theme_branch');

/**
 * This function sets up Tutor by preparing the environment, installing 
 * and enabling Tutor plugins, installing private packages and themes.
 * @async
 * @function
 * @throws {Error} If any errors occur during the operations.
 */
async function run() {
  try {
    await prepareEnvironment(
        tutorVersion,
        tutorPearsonPluginBranch,
        ghAccessToken,
    );
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
    if (extraPrivateRequirements) {
      const tutorConfigValue = await getTutorConfigValue(
          'OPENEDX_EXTRA_PRIVATE_REQUIREMENTS',
      );
      const privateRequirements = parseTutorConfigObject(
          tutorConfigValue,
      );
      await handlePrivatePackages(
          privateRequirements,
          ghAccessToken,
          tutorRoot,
      );
    }
    await installThemes(
        themeRepository,
        themeBranch,
        tutorRoot,
    );
  } catch (error) {
    console.log(error.message);
    core.setFailed(error.message);
  }
}

run();
