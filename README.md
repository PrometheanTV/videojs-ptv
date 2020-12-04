# videojs-ptv

[![npm version](https://badge.fury.io/js/%40ptv.js%2Fvideojs-ptv.svg)](https://badge.fury.io/js/%40ptv.js%2Fvideojs-ptv)

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
<script src="//path/to/video.min.js"></script>
<script src="//path/to/videojs-ptv.min.js"></script>
<script>
  var player = videojs("my-video");

  player.ptv();
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

var player = videojs("my-video");

player.ptv();
```

### RequireJS/AMD

When using with RequireJS (or another AMD library), get the script in whatever way you prefer and `require` the plugin as you normally would:

```js
require(["video.js", "@ptv.js/videojs-ptv"], function (videojs) {
  var player = videojs("my-video");

  player.ptv();
});
```

## Documentation

Please reference the Web SDK documentation for more information about the SDK:

- https://docs.promethean.tv/developer-sdk/integration-guide-web

### Plugin options Options

You may pass in an options object to the plugin upon initialization. This object may contain any of the following properties:

| Name             | Description                                                       | Type      | Acceptable Values               | Default |
| ---------------- | ----------------------------------------------------------------- | --------- | ------------------------------- | ------- |
| `apiHost`          | Api host url override for testing                                 | `String`  |                                 |         |
| `channelId`        | Identifier of the Promethean channel                              | `String`  |                                 |         |
| `debug`            | Whether to show debug messages in the console                     | `Boolean` |                                 | `false` |
| `embedHost`        | Embed host url override for testing                               | `String`  |                                 |         |
| `enableGeoBlock`   | Enable geo-blocking, useful for GDPR.                             | `Boolean` |                                 | `false` |
| `loadingPosterUrl` | Specify a loading poster url, overrides Broadcast Center setting. | `String`  |                                 | `null`  |
| `offlinePosterUrl` | Specify a offline poster url, overrides Broadcast Center setting. | `String`  |                                 | `null`  |
| `platformId`       | Vendor CMS platform identifier                                    | `String`  |                                 |         |
| `platformName`     | Vendor CMS name                                                   | `String`  | `brightcove` `truetv`           |         |
| `platformType`     | Vendor CMS platform key                                           | `String`  | `cmsid` `channelcode` `videoid` |
| `previewMode`      | Whether to show overlays for in preview mode                      | `Boolean` |                                 | `false` |
| `showOverlays`     | Whether to initially show overlays on load                        | `Boolean` |                                 | `false` |
| `showPoster`       | Whether to show poster on load and when offline                   | `Boolean` |                                 | `true`  |
| `streamId`         | Identifier of the Promethean stream                               | `String`  |                                 |
| `viewerId`         | Identifier of the viewer                                          | `String`  |                                 |
| `viewerLatitude`   | Geographic latitude of the viewer                                 | `String`  |                                 |
| `viewerLongitude`  | Geographic longitude of the viewer                                | `String`  |                                 |

## API

The plugin provides a top-level API to interact with SDK.

| Method     | Description                                                | Arguments                                                          | Usage                            |
| ---------- | ---------------------------------------------------------- | ------------------------------------------------------------------ | -------------------------------- |
| `hide`       | Hides all overlays                                         |                                                                    | `window.ptv.hide()`              |
| `load`       | Removes current overlays and loads new overlays            | `object` containing `channelId`, `platform` props , and `streamId` | `window.ptv.load(config)`        |
| `show`       | Shows all overlays                                         |                                                                    | `window.ptv.show()`              |
| `start`      | Starts the overlay rendering engine and shows all overlays |                                                                    | `window.ptv.start()`             |
| `stop`       | Stops the overlay rendering engine and hides all overlays  |                                                                    | `window.ptv.stop()`              |
| `timeUpdate` | Update the player time in seconds.                         | `number` in seconds                                                | `window.ptv.timeUpdate(seconds)` |

## License

MIT. Copyright (c) Promethean TV

[videojs]: http://videojs.com/
