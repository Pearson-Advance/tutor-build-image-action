const process = require('process');
const cp = require('child_process');
const path = require('path');

test('test runs', () => {
  process.env['INPUT_EXTRA_PRIVATE_REQUIREMENTS'] = 'false';
  process.env['INPUT_THEME_REPOSITORY'] = 'false';
  process.env['INPUT_TUTOR_VERSION'] = '15.3.3';
  process.env['INPUT_TUTOR_PLUGIN_SOURCES'] = '("git+https://github.com/overhangio/tutor-mfe.git" "git+https://github.com/Pearson-Advance/tutor-ecommerce" "git+https://github.com/Pearson-Advance/tutor-discovery")';
  process.env['INPUT_TUTOR_PEARSON_PLUGIN_URL'] = 'git+https://GH_TOKEN@github.com/Pearson-Advance/tutor-pearson-plugin.git@vue/PADV-329';
  const ip = path.join(__dirname, 'index.js');
  const result = cp.execSync(`node ${ip}`, {env: process.env}).toString();
  console.log(result);
})