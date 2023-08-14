const process = require('process');
const cp = require('child_process');
const path = require('path');

test('test runs', () => {
  process.env['INPUT_TUTOR_VERSION'] = '15.3.3';
  process.env['INPUT_TUTOR_PEARSON_PLUGIN_URL'] = 'git+https://GH_TOKEN@github.com/Pearson-Advance/tutor-pearson-plugin.git@vue/PADV-329';
  process.env['INPUT_TUTOR_PEARSON_PLUGIN_NAME'] = '("pearson-plugin-mfe-stg" "pearson-plugin-edxapp-stg" "pearson-plugin-discovery-stg" "pearson-plugin-ecommerce-stg")';
  process.env['INPUT_TUTOR_PLUGIN_SOURCES'] = '("git+https://github.com/Pearson-Advance/tutor-ecommerce" "git+https://github.com/Pearson-Advance/tutor-discovery")';
  process.env['INPUT_PLUGIN_NAMES'] = '("mfe" "ecommerce" "discovery")';
  process.env['INPUT_EXTRA_PRIVATE_REQUIREMENTS'] = 'true';
  process.env['INPUT_PRIVATE_REPOSITORIES'] = '("pearson-core" "course_operations" "secure-cloudfront-video")';
  process.env['INPUT_BRANCHES'] = '("master" "master" "master")';
  process.env['INPUT_THEME_REPOSITORY'] = 'https://github.com/Pearson-Advance/openedx-themes.git';
  process.env['INPUT_THEME_BRANCH'] = 'pearson-release/olive.stage';

  const ip = path.join(__dirname, 'index.js');
  const result = cp.execSync(`node ${ip}`, {env: process.env, stdio: 'inherit'});
  if (result != null) {
    console.log(result.toString());
  }
})