# videojs-ptv

[![npm version](https://badge.fury.io/js/%40ptv.js%2Fvideojs-ptv.svg)](https://badge.fury.io/js/%40ptv.js%2Fvideojs-ptv)
[![](https://data.jsdelivr.com/v1/package/npm/@ptv.js/videojs-ptv/badge)](https://www.jsdelivr.com/package/npm/@ptv.js/videojs-ptv)
![npm publish](https://github.com/PrometheanTV/videojs-ptv/workflows/npm%20publish/badge.svg)

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Installation](#installation)
- [Usage](#usage)
  - [`<script>` Tag](#script-tag)
  - [Browserify/CommonJS](#browserifycommonjs)
  - [RequireJS/AMD](#requirejsamd)
- [Documentation](#documentation)
  - [Plugin options Options](#plugin-options-options)
- [API](#api)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

```sh
npm install --save @ptv.js/videojs-ptv
```

## Usage

To include videojs-ptv on your website or web application, use any of the following methods.

### `<script>` Tag

This is the simplest case. Get the script in whatever way you prefer and include the plugin _after_ you include [video.js][videojs], so that the `videojs` global is available.

```html
<!-- Path to videojs (example for v7.10.2) -->
<script src="//cdn.jsdelivr.net/npm/video.js@7.10.2/dist/video.min.js"></script>
<!-- Path to videojs-ptv (example for v1.2.0) -->
<script src="//cdn.jsdelivr.net/npm/@ptv.js/videojs-ptv@1.1.0/dist/videojs-ptv.min.js"></script>
<script>
  var player = videojs("my-video");

  // Promethean TV SDK configuration (see options below).
  var config = {
    channelId: "your-channel-id",
    streamId: "your-stream-id",
  };

  var ptv = player.ptv(config);
</script>
```

### Browserify/CommonJS

When using with Browserify, install videojs-ptv via npm and `require` the plugin as you would any other module.

```js
var videojs = require("video.js");

// The actual plugin function is exported by this module, but it is also
// attached to the `Player.prototype`; so, there is no need to assign it
// to a variable.
require("@ptv.js/videojs-ptv");

// Promethean TV SDK configuration (see options below).
var config = {
  channelId: "your-channel-id",
  streamId: "your-stream-id",
};

var ptv = player.ptv(config);
```

### RequireJS/AMD

When using with RequireJS (or another AMD library), get the script in whatever way you prefer and `require` the plugin as you normally would:

```js
require(["video.js", "@ptv.js/videojs-ptv"], function (videojs) {
  var player = videojs("my-video");

  // Promethean TV SDK configuration (see options below).
  var config = {
    channelId: "your-channel-id",
    streamId: "your-stream-id",
  };

  var ptv = player.ptv(config);
});
```

## Examples

- [Basic JSFiddle example](https://jsfiddle.net/ptvandi/5o6neLbr/)

## Documentation

Please reference the [Web SDK documentation](https://docs.promethean.tv/developer-sdk/integration-guide-web) for more information about the SDK.

### Plugin Options

You may pass in an options object to the plugin upon initialization. This object may contain any of the following properties:

| Name               | Description                                                       | Type      | Default | Example                           |
| ------------------ | ----------------------------------------------------------------- | --------- | ------- | --------------------------------- |
| `apiHost`          | Api host url override for testing                                 | `String`  | `null`  |                                   |
| `channelId`        | Identifier of the Promethean channel                              | `String`  | `null`  |                                   |
| `debug`            | Whether to show debug messages in the console                     | `Boolean` | `false` |                                   |
| `embedHost`        | Embed host url override for testing                               | `String`  | `null`  |                                   |
| `enableGeoBlock`   | Enable geo-blocking, useful for GDPR.                             | `Boolean` | `false` |                                   |
| `loadingPosterUrl` | Specify a loading poster url, overrides Broadcast Center setting. | `String`  | `null`  |                                   |
| `offlinePosterUrl` | Specify a offline poster url, overrides Broadcast Center setting. | `String`  | `null`  |                                   |
| `platformId`       | Vendor CMS platform identifier                                    | `String`  | `null`  |                                   |
| `platformName`     | Vendor CMS name                                                   | `String`  | `null`  | `videojsPtv.PlatformNames.TRUE`   |
| `platformType`     | Vendor CMS platform key                                           | `String`  | `null`  | `videojsPtv.PlatformTypes.CMS_ID` |
| `previewMode`      | Whether to show overlays for in preview mode                      | `Boolean` | `false` |                                   |
| `showOverlays`     | Whether to initially show overlays on load                        | `Boolean` | `false` |                                   |
| `showPoster`       | Whether to show poster on load and when offline                   | `Boolean` | `false` |                                   |
| `streamId`         | Identifier of the Promethean stream                               | `String`  | `null`  |                                   |
| `viewerId`         | Identifier of the viewer                                          | `String`  | `null`  |                                   |
| `viewerLatitude`   | Geographic latitude of the viewer                                 | `String`  | `null`  |                                   |
| `viewerLongitude`  | Geographic longitude of the viewer                                | `String`  | `null`  |                                   |

## Static Types

The plugin provides a few top-level static types to help construct the configuration options.

| Name            | Description                               | Usage                                                        |
| --------------- | ----------------------------------------- | ------------------------------------------------------------ |
| `ApiHosts`      | API hosts for testing                     | `videojsPtv.ApiHostType.<COMDEV\|QA\|STAGING\|PRODUCTION>`   |
| `EmbedHosts`    | Embed hosts for testing                   | `videojsPtv.EmbedHostType.<COMDEV\|QA\|STAGING\|PRODUCTION>` |
| `PlatformNames` | Platform names for integrated partner CMS | `videojsPtv.PlatformNames.<TRUE>`                            |
| `PlatformTypes` | Platform types for integrated partner CMS | `videojsPtv.PlatformTypes.<CMS_ID>`                          |

## High-level API

The plugin provides a top-level API to manually interact with the SDK.

| Method       | Description                                                | Arguments                   | Usage                     |
| ------------ | ---------------------------------------------------------- | --------------------------- | ------------------------- |
| `hide`       | Hides all overlays                                         |                             | `ptv.hide()`              |
| `load`       | Removes current overlays and loads new overlays            | (see configuration options) | `ptv.load(config)`        |
| `show`       | Shows all overlays                                         |                             | `ptv.show()`              |
| `start`      | Starts the overlay rendering engine and shows all overlays |                             | `ptv.start()`             |
| `stop`       | Stops the overlay rendering engine and hides all overlays  |                             | `ptv.stop()`              |
| `timeUpdate` | Update the player time in seconds.                         | `number` in seconds         | `ptv.timeUpdate(seconds)` |

## License

MIT. Copyright (c) Promethean TV

[videojs]: http://videojs.com/
