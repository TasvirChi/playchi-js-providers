# PlayChi JS Providers - Cloud TV and OVP Media Provider Plugins for the [PlayChi JS Player]

[![Build Status](https://github.com/tasvirchi/playchi-js-providers/actions/workflows/run_canary_full_flow.yaml/badge.svg)](https://github.com/tasvirchi/playchi-js-providers/actions/workflows/run_canary_full_flow.yaml)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![](https://img.shields.io/npm/v/@playchi-js/playchi-js-providers/latest.svg)](https://www.npmjs.com/package/@playchi-js/playchi-js-providers)
[![](https://img.shields.io/npm/v/@playchi-js/playchi-js-providers/canary.svg)](https://www.npmjs.com/package/@playchi-js/playchi-js-providers/v/canary)

The PlayChi JS Providers plugin helps integrate Tasvirchi OVP and Cloud TV backend data APIs with the [PlayChi JS Player].

PlayChi JS Providers is written in [ECMAScript6], analyzed statically using [Flow], and transpiled in ECMAScript5 using [Babel].

[flow]: https://flow.org/
[ecmascript6]: https://github.com/ericdouglas/ES6-Learning#articles--tutorials
[babel]: https://babeljs.io
[playchi js player]: https://github.com/tasvirchi/playchi-js

## Table of Contents

- [Getting Started](#getting-started)
  - [Installing](#installing)
  - [Building](#building)
  - [Embed the Library In Your Test Page](#embed-the-library-in-your-test-page)
- [Documentation](#documentation)
- [Running the Tests](#running-the-tests)
- [Compatibility](#compatibility)
- [Contributing](#contributing)
- [Versioning](#versioning)
- [Licensing](#licensing)

## Getting Started

### Installing

First, clone and run [yarn] to install the required dependencies:

[yarn]: https://yarnpkg.com/lang/en/

```
git clone https://github.com/tasvirchi/playchi-js-providers.git
cd playchi-js-providers
yarn install
```

### Building

Next, build the player:

```javascript
yarn run build
```

### Embed the Library In Your Test Page

Finally, add the bundle as a script tag in your page, and initialize the provider:

**OVP Provider**

```html
<script type="text/javascript" src="/PATH/TO/FILE/playchi-ovp-provider.js"></script>
<div id="player-placeholder" style="height:360px; width:640px">
  <script type="text/javascript">
    // Step 1 - Create a provider options object
    var options = {
      partnerId: "YOUR_PARTNER_ID", // Mandatory
      ts: "YOUR_TS", // Optional
      log:{
        level: "LOG_LEVEL", // Optional
      }
      uiConfId: UI_CONF_ID,  // Optional
      env: {  // Optional
        serviceUrl: "YOUR_SERVICE_URL",
        cdnUrl: "YOUR_CDN_URL"
      }
    };
    // Step 2 - Create a provider instance
    var provider = new playchi.providers.ovp.Provider(options);
    // Step 3 - Create media info object
    var mediaInfo = {
      entryId: "YOUR_ENTRY_ID" // Mandatory
      ts: "YOUR_TS" // Optional
    };
    // Step 4 - Get the media config
    provider.getMediaConfig(mediaInfo).then(function(mediaConfig) {
      // Manipulate media config
    });
  </script>
</div>
```

**Cloud TV Provider**

```html
<script type="text/javascript" src="/PATH/TO/FILE/playchi-ott-provider.js"></script>
<div id="player-placeholder" style="height:360px; width:640px">
  <script type="text/javascript">
    // Step 1 - Create a provider options object
    var options = {
      partnerId: "YOUR_PARTNER_ID", // Mandatory
      ts: "YOUR_TS", // Optional
      log:{
       level:"LOG_LEVEL", // Optional
      }
      uiConfId: UI_CONF_ID,  // Optional
      env: {  // Optional
        serviceUrl: "YOUR_SERVICE_URL",
        cdnUrl: "YOUR_CDN_URL"
      }
    };
    // Step 2 - Create a provider instance
    var provider = new playchi.providers.ott.Provider(options);
    // Step 3 - Create media info object
    var mediaInfo = {
      entryId: "YOUR_ENTRY_ID", // Mandatory
      ts: "YOUR_TS", // Optional,
      mediaType: "YOUR_MEDIA_TYPE" // Optional, default: "MEDIA"
      contextType: "YOUR_MEDIA_CONTEXT_TYPE", // Optional, default: "PLAYBACK"
      protocol: "YOUR_PROTOCOL", // Optional
      fileIds: "YOUR_FILE_IDS" // Optional
    };
    // Step 4 - Get the media config
    provider.getMediaConfig(mediaInfo).then(function(mediaConfig) {
      // Manipulate media config
    });
  </script>
</div>
```

## Documentation

- **[Configuration](docs/configuration.md)**
- **API**

## Running the Tests

You can run tests locally via [Karma], which will run on Chrome, Firefox and Safari browsers.

[karma]: https://karma-runner.github.io/1.0/index.html

```
yarn run test
```

You can also test individual browsers in the following way:

```
yarn run test:chrome
yarn run test:firefox
yarn run test:safari
```

### Coding Style Tests

Tasvirchi uses ESLint [recommended set](http://eslint.org/docs/rules/) with some additions for enforcing [Flow] types and other rules.

See [ESLint config](.eslintrc.json) for the full configuration.

We also use [.editorconfig](.editorconfig) to maintain consistent coding styles and settings; please make sure you comply with these styles.

## Compatibility

TBD

## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the available versions, see the [tags on this repository](https://github.com/tasvirchi/playchi-js-providers/tags).

## Licensing

This project is licensed under the AGPL-3.0 License - see the [LICENSE.md](LICENSE.md) file for details
