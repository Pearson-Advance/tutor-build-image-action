const core = require('@actions/core');
const exec = require('@actions/exec');

const fs = require('fs');

const { parse_bash_array, enable_plugins, move_all } = require('./util.js');

// exec options
const options = {
  shell: '/bin/bash'
};

// Standard out and standard error will be written to these variables
var myOutput = "";
var myError = "";
options.listeners = {
  stdout: (data) => {
    myOutput += data.toString();
  },
  stderr: (data) => {
    myError += data.toString();
  }
};

// Reading inputs
const tutor_version = core.getInput('tutor_version');
const tutor_pearson_plugin_url = core.getInput('tutor_pearson_plugin_url');
const gh_access_token = core.getInput('gh_access_token');
const tutor_pearson_plugins = core.getInput('tutor_pearson_plugin_name');
const tutor_plugin_sources = core.getInput('tutor_plugin_sources');
const tutor_plugin_names = core.getInput('tutor_plugin_names');
const extra_private_requirements = core.getBooleanInput('extra_private_requirements');
const private_repositories = core.getInput('private_repositories');
const branches = core.getInput('branches');
const theme_repository  = core.getInput('theme_repository');
const theme_branch  = core.getInput('theme_branch');

async function run() {
  try {
      // Create and activate virtualenv
      await exec.exec('python3', ['-m', 'venv', 'venv'], options);
      core.info('Virtualenv created');

      // Install Tutor
      core.info('Installing Tutor');
      await exec.exec('venv/bin/python', ['-m', 'pip', 'install', `tutor[full]==${tutor_version}`], options);

      // Install the Tutor Pearson Plugin
      core.info('Installing Tutor Pearson plugin');
      const gh_token_url = tutor_pearson_plugin_url.replace("GH_TOKEN", gh_access_token);
      await exec.exec('venv/bin/pip', ['install', gh_token_url], options);

      // Install Tutor plugins
      if (tutor_plugin_sources) {
          core.info('Installing Tutor plugins.');
          for (var i=0; i < tutor_plugin_sources.length; i++) {
              await exec.exec('venv/bin/pip', ['install',  tutor_plugin_sources[i]], options);
          }
      }

      // Path to the tutor root will be saved in this variable
      var tutor_root = "";
      var tutor_root_options = {
        shell: '/bin/bash'
      };
      tutor_root_options.listeners = {
        stdout: (data) => {
          tutor_root += data.toString();
        },
        stderr: (data) => {
          myError += data.toString();
        }
      };

      await exec.exec('venv/bin/tutor', ['config', 'save'], options);

      // Running 'tutor config printroot' and saving the output to a variable
      await exec.exec('venv/bin/tutor', ['config', 'printroot'], tutor_root_options);
      tutor_root = tutor_root.trim();
      core.info(`tutor_root: ${tutor_root}`);

      // Create private.txt file
      await exec.exec('touch', [`${tutor_root}/env/build/openedx/requirements/private.txt`], options);

      // Install extra requirements
      if (extra_private_requirements) {
        core.info('Installing extra private requirements.');
        const repositories = parse_bash_array(private_repositories);
        const branches_array = parse_bash_array(branches);
        for (var i=0; i< repositories.length; i++) {
          let repository = repositories[i];
          let branch = branches_array[i]
          if (repository == "") {
            continue;
          }
          if (branch) {
            await exec.exec(
              'git',
              [
                'clone', '-b', branch,
                `https://${gh_access_token}@github.com/Pearson-Advance/${repository}.git`,
                `${tutor_root}/env/build/openedx/requirements/${repository}`
              ],
              options
            );
          }
          else {
            await exec.exec(
              'git',
              [
                'clone',
                `https://${gh_access_token}@github.com/Pearson-Advance/${repository}.git`,
                `${tutor_root}/env/build/openedx/requirements/${repository}`
              ],
              options
            );
          }

          // Write requirement to the private.txt file
          fs.appendFileSync(`${tutor_root}/env/build/openedx/requirements/private.txt`, `-e ./${repository}\n`);
        }
      }

      // Enable Tutor plugins (global)
      if (tutor_plugin_names) {
        core.info('Enabling Tutor plugins (Global for all services and environments).');
        const plugin_names = parse_bash_array(tutor_plugin_names);
        await enable_plugins(plugin_names, options);
      }

      // Enable Tutor plugins (from tutor pearson plugin, according to service and environment)
      if (tutor_pearson_plugins) {
        core.info('Enabling Tutor Pearson plugins (According to service and environment).');
        await enable_plugins(parse_bash_array(tutor_pearson_plugins), options);
      }

      // Render Tutor Templates
      await exec.exec('venv/bin/tutor', ['config', 'save'], options);

      // Install themes
      if (theme_repository != 'false') {
        const themes_path = `${tutor_root}/env/build/openedx/themes/`;
        const ecommerce_themes_path = `${tutor_root}/env/plugins/ecommerce/build`
        await exec.exec('git', ['clone', '-b', theme_branch, theme_repository], options);
        
        move_all('openedx-themes/edx-platform/', themes_path);
        move_all('openedx-themes/ecommerce/', ecommerce_themes_path);

      }
  }
  catch(error) {
    console.log(myOutput);
    console.log(myError);
    console.log(error.message);
    core.setFailed(myError);
  }

}

run()