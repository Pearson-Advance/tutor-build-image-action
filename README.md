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
  docker:
    runs-on: ubuntu-latest
    steps:

      - name: Build Image
        uses: pearson-advance/tutor-build-image-action@0.0.1.alpha
        with:
          image-to-be-built: 'openedx'
          repository-name: 'pearsonopenedxops'
          image-name: 'tutor-test'
          docker-username: ${{ secrets.DOCKERHUB_USERNAME }}
          docker-token: ${{ secrets.DOCKERHUB_TOKEN }}
```

# Customizing

## inputs

|      **Name**     | **Type** |                                               **Description**                                              |
|:-----------------:|:--------:|:----------------------------------------------------------------------------------------------------------:|
| python-version    | String   | The version of Python. It is useful since venv will be created from it. Defaults to 3.8.                   |
| tutor-version     | String   | The version of Tutor to be installed. Defaults to 15.3.0.                                                  |
| repository-name   | String   | The name of the repository created in Docker Hub in which the newly built image will be pushed and tagged. |
| path-image-to-be-built   | String   | Path (inside tutor root folder) to the folder containting the dockerfile. For example: for ecommerce plugin /env/plugins/ecommerce/build/ecommerce. For edx-platform /env/build/openedx|
| image-name        | String   | The name of the image that will be pushed to Docker Hub.                                                   |
| image-tag         | String   | The tag of the image that will be pushed to Docker Hub. Defaults to latest.                                |
| docker-username   | String   | Username of the user created in Docker Hub.                                                                |
| docker-token      | String   | Password of the user created in Docker Hub.                                                                |
| no-docker-cache   | Bool     | Determines wheter to use docker caching.                                                                   |
