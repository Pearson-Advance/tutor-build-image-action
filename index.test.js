const process = require('process');
const cp = require('child_process');
const path = require('path');

test('test runs', () => {
  process.env['INPUT_TUTOR_VERSION'] = '15.3.3';
  process.env['INPUT_TUTOR_PEARSON_PLUGIN_BRANCH'] = 'main';
  process.env['INPUT_TUTOR_ADDITIONAL_PLUGIN_SOURCES'] = '("git+https://github.com/overhangio/tutor-mfe.git" "git+https://github.com/Pearson-Advance/tutor-ecommerce.git" "git+https://github.com/Pearson-Advance/tutor-discovery.git")';
  process.env['INPUT_TUTOR_PEARSON_PLUGINS_TO_ENABLE'] = '("pearson-plugin-mfe-stg" "pearson-plugin-edxapp-stg" "pearson-plugin-discovery-stg" "pearson-plugin-ecommerce-stg")';
  process.env['INPUT_TUTOR_PLUGINS_TO_ENABLE'] = '("mfe" "ecommerce" "discovery")';
  process.env['INPUT_EXTRA_PRIVATE_REQUIREMENTS'] = 'true';
  process.env['INPUT_PRIVATE_REPOSITORIES'] = '("pearson-core" "course_operations" "secure-cloudfront-video")';
  process.env['INPUT_PRIVATE_REPOSITORIES_BRANCHES'] = '("master" "master" "master")';
  process.env['INPUT_THEME_REPOSITORY'] = 'https://github.com/Pearson-Advance/openedx-themes.git';
  process.env['INPUT_THEME_BRANCH'] = 'pearson-release/olive.stage';

  const ip = path.join(__dirname, 'index.js');
  const result = cp.execSync(`node ${ip}`, {env: process.env, stdio: 'inherit'});
  if (result != null) {
    console.log(result.toString());
  }
})
