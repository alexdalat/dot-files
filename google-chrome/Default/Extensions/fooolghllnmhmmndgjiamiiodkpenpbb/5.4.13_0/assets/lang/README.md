## Dealing with Translations

This directory contains translation files that get uploaded and downloaded to and from [lokalise](https://lokalise.com) service.

All `.json` files containing translations to different languages should be placed inside this directory. In case of having to do manual edits,
refer to [JSON structure](https://docs.lokalise.com/en/articles/3229161-structured-json).

`yarn compile-translations` converts files in this directory to a format usable inside the application and places them inside the `compiled` directory. This command should be run locally after replacing/editing translation files. It is run automatically in CI during install phase.

Contents of `compiled` do not need to be committed to version control.
