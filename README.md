# videojs-ptv



## Table of Contents

<!-- START doctoc -->
<!-- END doctoc -->
## Installation

```sh
npm install --save @ptv-plugin-vjs/videojs-ptv
```

## Usage

To include videojs-ptv on your website or web application, use any of the following methods.

### `<script>` Tag

This is the simplest case. Get the script in whatever way you prefer and include the plugin _after_ you include [video.js][videojs], so that the `videojs` global is available.

```html
<script src="//path/to/video.min.js"></script>
<script src="//path/to/videojs-ptv.min.js"></script>
<script>
  var player = videojs('my-video');

  player.ptv();
</script>
```

### Browserify/CommonJS

When using with Browserify, install videojs-ptv via npm and `require` the plugin as you would any other module.

```js
var videojs = require('video.js');

// The actual plugin function is exported by this module, but it is also
// attached to the `Player.prototype`; so, there is no need to assign it
// to a variable.
require('@ptv-plugin-vjs/videojs-ptv');

var player = videojs('my-video');

player.ptv();
```

### RequireJS/AMD

When using with RequireJS (or another AMD library), get the script in whatever way you prefer and `require` the plugin as you normally would:

```js
require(['video.js', '@ptv-plugin-vjs/videojs-ptv'], function(videojs) {
  var player = videojs('my-video');

  player.ptv();
});
```

## License

MIT. Copyright (c) Alexander Syed &lt;alexksyed@gmail.com&gt;


[videojs]: http://videojs.com/
