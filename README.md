# About

JavaScript Action to setup Tutor to build Docker images for a Pearson-Advance Open edX installation.

- [About](#about)
- [Usage](#usage)
- [Customizing](#customizing)
- [inputs](#inputs)

# Usage

In this example you will see how to use this Action. Also the different parameters that are
needed to start the workflow.

```
name: Tutor Build Action Test

jobs:
  Build:
    runs-on: ubuntu-latest
    steps:

      - name: Setup Tutor
        uses: Pearson-Advance/tutor-build-image-action@main
        with:
          tutor_version: ${{ vars.BUILD_TUTOR_VERSION }}
          gh_access_token: ${{ secrets.GH_PAT }}
          tutor_pearson_plugin_branch: ${{ inputs.tutor_pearson_plugin_branch }}
          tutor_plugin_sources: ${{ vars.TUTOR_PLUGIN_SOURCES }}
          tutor_pearson_plugins_to_enable: ${{ env.PLUGINS_TO_ENABLE }}
          tutor_plugins_to_enable: ${{ vars.TUTOR_PLUGIN_NAMES }}
          theme_repository: ${{ VARS.THEME_REPOSITORY }}
          theme_branch: "pearson-release/olive.stage"
```

# Customizing

## inputs

|          **Name**          | **Type** | **Required** |                                                                                                                                                                                                                          **Description**                                                                                                                                                                                                                         |
|:--------------------------:|:--------:|:------------:|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------:|
| tutor-version              | String   | Yes          | The version of Tutor to be installed. Defaults to 15.3.0.
| theme-repository           | String   | No           | Repository that contains customized themes. You have to indicate full URL path (e.g., [theme-repository](https://github.com/Pearson-Advance/openedx-themes])) The default is "false", which indicates that the functionality of the themes will not be used.
| theme-branch               | String   | Yes          | Theme repository branch to be cloned (e.g., pearson-release/juniper.master). It is necessary to specify the target branch if you decide to install theme repository. Otherwise no.
| gh-access-token            | String   | Yes          | Personal Access Token (PAT). If you have not configured it yet, enter [here](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) to see how create a PAT. When it is already configured, you can add it as a secrets for the repository. To see how create a secret enter [here](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository).
| tutor-plugin-sources       | Array    | No           | Array containing the GitHub sources urls or the pypi package names of the plugins to install. Example: ("git+https://github.com/overhangio/tutor-ecommerce.git" "git+https://github.com/overhangio/tutor-mfe.git" "tutor-discovery").
| tutor-plugin-names         | Array    | No           | Array containing the names of the plugins to enable. Example: ("ecommerce" "discovery" "mfe").                                                             
| tutor-pearson-plugin-name       | String   | No           | Array containing the names of the plugins of tutor-pearson-plugin to be enabled. Example: ("pearson-plugin-mfe-stg" "pearson-plugin-edxapp-stg" "pearson-plugin-discovery-stg" "pearson-plugin-ecommerce-stg").                                                  