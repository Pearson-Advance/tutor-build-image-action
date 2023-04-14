# About

Composite Action to build and push Docker images from Tutor to Docker Hub.

-   [Usage](https://github.com/Pearson-Advance/tutor-build-image-action#usage)
-   [Customizing](https://github.com/Pearson-Advance/tutor-build-image-action#customizing)
    -   [inputs](https://github.com/Pearson-Advance/tutor-build-image-action#inputs)

# Usage

In this example you will see how to use this Composite Action. Also the different parameters that are
needed to start the workflow.

```
name: Tutor Build Action Test

on:
  push:
    branches:
      - 'vue/PADV-317'

jobs:
  Build:
    runs-on: ubuntu-latest
    steps:

      - name: Build Image
        uses: pearson-advance/tutor-build-image-action@0.2.0
        with:
          path-image-to-be-built: 'env/plugins/ecommerce/build/ecommerce'
          organization-name: 'pearsonopenedxops'
          repository-name: 'tutor-test'
          docker-username: ${{ secrets.DOCKERHUB_USERNAME }}
          docker-token: ${{ secrets.DOCKERHUB_TOKEN }}
          extra-private-requirements: true
          gh-access-token: ${{ secrets.GH_PAT }}
```

# Customizing

## inputs

|          **Name**          | **Type** | **Required** |                                                                                                                                                                                                                          **Description**                                                                                                                                                                                                                         |
|:--------------------------:|:--------:|:------------:|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------:|
| python-version             | String   | No           | The version of Python. It is useful since venv will be created from it. Defaults to 3.8.                                                                                                                                                                                                                                                                                                                                                                         |
| tutor-version              | String   | Yes          | The version of Tutor to be installed. Defaults to 15.3.0.                                                                                                                                                                                                                                                                                                                                                                                                        |
| organization-name          | String   | Yes          | The name of the organization created in Docker Hub in which the newly built image will be pushed and tagged.                                                                                                                                                                                                                                                                                                                                                     |
| repository-name            | String   | Yes          | The name of the repository created in Docker Hub in which the newly built image will be pushed and tagged.                                                                                                                                                                                                                                                                                                                                                       |
| image-tag                  | String   | No           | The tag of the image that will be pushed to Docker Hub. Defaults to latest. It is important to use a correctly versioning (e.g., 1.0.0). To see how to do it enter [here](https://semver.org/#semantic-versioning-200).                                                                                                                                                                                                                                          |
| path-image-to-be-built     | String   | Yes          | Path (inside tutor root folder) to the folder containting the dockerfile. For example: for ecommerce plugin /env/plugins/ecommerce/build/ecommerce. For edx-platform /env/build/openedx.                                                                                                                                                                                                                                                                         |
| docker-username            | String   | Yes          | Username of the user created in Docker Hub.                                                                                                                                                                                                                                                                                                                                                                                                                      |
| docker-token               | String   | Yes          | Password of the user created in Docker Hub.                                                                                                                                                                                                                                                                                                                                                                                                                      |
| extra-private-requirements | Bool     | No           | A boolean value that indicates if you want to install extra private requirements. Defaults to false.                                                                                                                                                                                                                                                                                                                                                             |
| theme-repository           | String   | No           | Repository that contains customized themes. You have to indicate full URL path (e.g., [theme-repository](https://github.com/Pearson-Advance/openedx-themes]))                                                                                                                                                                                                                                                                                                    |
| theme-branch               | String   | Yes          | Theme repository branch to be cloned (e.g., pearson-release/juniper.master). It is necessary to specify the target branch if you decide to install theme repository. Otherwise no.                                                                                                                                                                                                                                                                               |
| gh-access-token            | String   | Yes          | Personal Access Token (PAT). If you have not configured it yet, enter [here](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) to see how create a PAT. When it is already configured, you can add it as a secrets for the repository. To see how create a secret enter [here](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository). |
| private-repositories       | Array    | No           | It is an array that contains the name of all private repositories. You can configured the value of this parameter such as environment variable in the settings of the repository that contains the workflow.                                                                                                                                                                                                                                                     |
| branches                   | Array    | No           | Branches is an array that contains the name of the different target branches to be cloned. You have to be careful with this array and repositories array, because both should have the same length, and correctly set the branch for each repository.                                                                                                                                                                                                            |
| use-docker-cache           | Bool     | No           | Determines whether to use docker caching.                                                                                                                                                                                                                                                                                                                                                                                                                        |
| tutor-plugin-sources       | Array    | No           | Array containing the GitHub sources urls or the pypi package names of the plugins to install. Example: ("git+https://github.com/overhangio/tutor-ecommerce.git" "git+https://github.com/overhangio/tutor-mfe.git" "tutor-discovery")                                                                                                                                                                                                                             |
| tutor-plugin-names         | Array    | No           | Array containing the names of the plugins to enable. Example: ("ecommerce" "discovery" "mfe")                                                                                                                                                                                                                                                                                                                                                                    |
| tutor-pearson-plugin-url   | String   | No           | Action environment variable to obtain the tutor pearson plugin URL from GitHub following [Github Secret Variables](https://docs.github.com/en/actions/learn-github-actions/variables#defining-configuration-variables-for-multiple-workflows).                                                                                                                                                                                                                   |
| tutor-pearson-plugin-name       | String   | No           | It represents the plugin of tutor-pearson-plugin to be enabled. (e.g., pearson-plugin-discovery, pearson-plugin-ecommerce, pearson-plugin-edxapp)                                                                                                                                                                                                                                                                                                                |
