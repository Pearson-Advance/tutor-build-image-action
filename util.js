const exec = require('@actions/exec');

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
        arr = a.substring(1, a.length-1);
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
        await exec.exec('venv/bin/tutor', ['plugins', 'enable', to_enable[i]], exec_options);
    }
}

module.exports = { parse_bash_array, enable_plugins };