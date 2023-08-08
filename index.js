const core = require('@actions/core');
const exec = require('@actions/exec');

const fs = require('fs');

/**
 * Parses a string containing an array of strings in the bash syntax.
 * @param  {String} arr Bash array as a string. Example: ("abc" "def")
 * @return {[type]}     Parsed array.
 */
function parse_bash_array(arr) {
  if (!arr || arr == "()" || arr == "false") {
    return [];
  }
  var Arr = arr.substring(1, arr.length-1);
  Arr = Arr.split(" ");
  Arr = Arr.map(a => a.substring(1, a.length-1));
  return Arr;
}

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
      await exec.exec('venv/bin/python', ['-m', 'pip', 'install', `tutor==${tutor_version}`], options);

      // Install the Tutor Pearson Plugin
      if (tutor_pearson_plugin_url) {
          core.info('Installing Tutor Pearson plugin');
          const gh_token_url = tutor_pearson_plugin_url.replace("GH_TOKEN", gh_access_token);
          await exec.exec('venv/bin/pip', ['install', gh_token_url], options);
      }

      // Install Tutor plugins
      if (tutor_plugin_sources) {
          core.info('Installing Tutor plugins.');
          const plugin_sources = parse_bash_array(tutor_plugin_sources);
          for (var i=0; i < plugin_sources.length; i++) {
              await exec.exec('venv/bin/pip', ['install',  plugin_sources[i]], options);
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
          let branch = branches_array[i];
          if (repository == "") {
            continue;
          }
          await exec.exec(
            'git',
            [
              'clone', '-b', branch,
              `https://${gh_access_token}@github.com/Pearson-Advance/${repository}.git`,
              `${tutor_root}/env/build/openedx/requirements/${repository}`
            ],
            options
          );

          // Write requirement to the private.txt file
          fs.appendFileSync(`${tutor_root}/env/build/openedx/requirements/private.txt`, `-e ./${repository}\n`);
        }
      }

      // Enable Tutor plugins (global)
      if (tutor_plugin_names) {
        core.info('Enabling Tutor plugins.');
        const plugins = parse_bash_array(tutor_plugin_names);
        for (var i=0; i < plugins.length; i++) {
            await exec.exec('venv/bin/tutor', ['plugins', 'enable', plugins[i]], options);
        }
      }

      // Enable Tutor plugins (from tutor pearson plugin, according to service and environment)
      if (tutor_pearson_plugins) {
        const to_enable = parse_bash_array(tutor_pearson_plugins);
        
        for (var i=0; i < to_enable.length; i++) {
          const plugin_name = to_enable[i];
          await exec.exec('venv/bin/tutor', ['plugins', 'enable', plugin_name], options);
        }
      }

      // Render Tutor Templates
      await exec.exec('venv/bin/tutor', ['config', 'save'], options);

      // Install themes
      if (theme_repository != 'false') {
        const themes_path = `${tutor_root}/env/build/openedx/themes/`;
        await exec.exec('git', ['clone', '-b', theme_branch, theme_repository], options);

        var to_move;
        if (fs.existsSync(themes_path)) {
          to_move = fs.readdirSync('openedx-themes/edx-platform/');
        }
        else {
          to_move = [];
        }
  
        for (var i = to_move.length - 1; i >= 0; i--) {
          var file = to_move[i];
          fs.renameSync('openedx-themes/edx-platform/' + file, themes_path + file);
        }

      }
  }
  catch(error) {
    console.log(error.message);
    core.setFailed(error.message);
  }

}

run()