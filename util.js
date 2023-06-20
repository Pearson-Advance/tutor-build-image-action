const core = require('@actions/core');
const exec = require('@actions/exec');

const fs = require('fs');

/**
 * Parses a string containing an array of strings in the bash syntax.
 * @param  {String} arr Bash array as a string. Example: ("abc" "def")
 * @return {Object}     Parsed array.
 */
function parse_bash_array(arr) {
    if (!arr || arr == "()" || arr == "'()'" || arr == "false") {
      return [];
    }
    if (arr.at(0) == "'" && arr.at(-1) == "'") {
        arr = arr.substring(1, arr.length-1);
    }
    let Arr = arr.substring(1, arr.length-1);
    Arr = Arr.split(" ");
    Arr = Arr.map(a => a.substring(1, a.length-1));
    return Arr;
  }
  
/**
 * Receives an array of strings with tutor plugin names and enables them.
 * @param  {String} plugins Bash array as a string. Example: ("abc" "def")
 */
async function enable_plugins(to_enable, exec_options) {
    for (var i=0; i < to_enable.length; i++) {
        core.info(`Enabling ${to_enable[i]}`)
        await exec.exec('venv/bin/tutor', ['plugins', 'enable', to_enable[i]], exec_options);
    }
}

/**
 * Moves all contents from a path to another.
 * @param  {String} old_path Origin path
 * @param  {String} new_path Target path
 */
function move_all(old_path, new_path) {
    if (!fs.existsSync(old_path)) {
        core.info(`Path ${themes_path} was not found.`);
        return;
    }
    if (!fs.existsSync(new_path)) {
        core.info(`Path ${new_path} was not found.`);
        return;
    }

    const to_move = fs.readdirSync(old_path);

    for (var i = to_move.length - 1; i >= 0; i--) {
      let file = to_move[i];
      fs.renameSync(old_path + file, new_path + file);
    }
}

module.exports = { parse_bash_array, enable_plugins, move_all };