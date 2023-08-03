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

on:
  push:
    branches:
      - 'vue/PADV-329'

jobs:
  Build:
    runs-on: ubuntu-latest
    steps:

      - name: Setup Tutor
        uses: Pearson-Advance/tutor-build-image-action@PADV-329
        with:
          tutor_version: ${{ vars.BUILD_TUTOR_VERSION }}
          gh_access_token: ${{ secrets.GH_PAT }}
          extra_private_requirements: ${{ vars.INSTALL_PRIVATE_REQUIREMENTS }}
          private_repositories: ${{ vars.PRIVATE_REQUIREMENTS_LIST }}
          branches: ${{ vars.BUILD_BRANCHES }}
          tutor_pearson_plugin_url: ${{ vars.TUTOR_PEARSON_PLUGIN_URL }}
          tutor_pearson_plugin_name: '("pearson-plugin-mfe-stg" "pearson-plugin-edxapp-stg" "pearson-plugin-discovery-stg" "pearson-plugin-ecommerce-stg")'
          tutor_plugin_sources: ${{ vars.TUTOR_PLUGIN_SOURCES }}
          tutor_plugin_names: ${{ vars.TUTOR_PLUGIN_NAMES }}
          theme_repository: "https://github.com/Pearson-Advance/openedx-themes.git"
          theme_branch: "pearson-release/olive.stage"
```

# Customizing

## inputs

|          **Name**          | **Type** | **Required** |                                                                                                                                                                                                                          **Description**                                                                                                                                                                                                                         |
|:--------------------------:|:--------:|:------------:|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------:|
| tutor-version              | String   | Yes          | The version of Tutor to be installed. Defaults to 15.3.0.                                                                                                                                                                                                                                                                                                                                                                                                        |
| extra-private-requirements | Bool     | No           | A boolean value that indicates if you want to install extra private requirements. Defaults to false.                                                                                                                                                                                                                                                                                                                                                             |
| theme-repository           | String   | No           | Repository that contains customized themes. You have to indicate full URL path (e.g., [theme-repository](https://github.com/Pearson-Advance/openedx-themes])) The default is "false", which indicates that the functionality of the themes will not be used.                                                                                                                                                                                                                                                                                                    |
| theme-branch               | String   | Yes          | Theme repository branch to be cloned (e.g., pearson-release/juniper.master). It is necessary to specify the target branch if you decide to install theme repository. Otherwise no.                                                                                                                                                                                                                                                                               |
| gh-access-token            | String   | Yes          | Personal Access Token (PAT). If you have not configured it yet, enter [here](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) to see how create a PAT. When it is already configured, you can add it as a secrets for the repository. To see how create a secret enter [here](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository). |
| private-repositories       | Array    | No           | It is an array that contains the name of all private repositories. You can configured the value of this parameter such as environment variable in the settings of the repository that contains the workflow.                                                                                                                                                                                                                                                     |
| branches                   | Array    | No           | Branches is an array that contains the name of the different target branches to be cloned. You have to be careful with this array and repositories array, because both should have the same length, and correctly set the branch for each repository.                                                                                                                                                                                                            |
| tutor-plugin-sources       | Array    | No           | Array containing the GitHub sources urls or the pypi package names of the plugins to install. Example: ("git+https://github.com/overhangio/tutor-ecommerce.git" "git+https://github.com/overhangio/tutor-mfe.git" "tutor-discovery")                                                                                                                                                                                                                             |
| tutor-plugin-names         | Array    | No           | Array containing the names of the plugins to enable. Example: ("ecommerce" "discovery" "mfe")                                                                                                                                                                                                                                                                                                                                                                    |
| tutor-pearson-plugin-url   | String   | No           | Action environment variable to obtain the tutor pearson plugin URL from GitHub following [Github Secret Variables](https://docs.github.com/en/actions/learn-github-actions/variables#defining-configuration-variables-for-multiple-workflows).                                                                                                                                                                                                                   |
| tutor-pearson-plugin-name       | String   | No           | Array containing the names of the plugins of tutor-pearson-plugin to be enabled. Example: ("pearson-plugin-mfe-stg" "pearson-plugin-edxapp-stg" "pearson-plugin-discovery-stg" "pearson-plugin-ecommerce-stg").                                                                                                                                                                                                                                                                                                             |
