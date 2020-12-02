import videojs from 'video.js';
import {version as VERSION} from '../package.json';

const Plugin = videojs.getPlugin('plugin');

// Default options for the plugin.
const defaults = {};

/**
 * An advanced Video.js plugin. For more information on the API
 *
 * See: https://blog.videojs.com/feature-spotlight-advanced-plugins/
 */
class Ptv extends Plugin {

  /**
   * Create a Ptv plugin instance.
   *
   * @param  {Player} player
   *         A Video.js Player instance.
   *
   * @param  {Object} [options]
   *         An optional options object.
   *
   *         While not a core part of the Video.js plugin architecture, a
   *         second argument of options is a convenient way to accept inputs
   *         from your plugin's caller.
   */
  constructor(player, options) {
    // the parent class will add player under this.player
    super(player);

    this.options = videojs.mergeOptions(defaults, options);

    this.player.ready(() => {
      this.player.addClass('vjs-ptv');
      console.log('plugin ready');
      const iframe = document.createElement('iframe');
      iframe.className = 'ptv-iframe';
      iframe.setAttribute('src', 'https://embed.promethean.tv/index.html')
      const el = this.player.el();
      console.log('player', el);
      this.player.el().appendChild(iframe);
    });
  }
}

// Define default values for the plugin's `state` object here.
Ptv.defaultState = {};

// Include the version number.
Ptv.VERSION = VERSION;

// Register the plugin with video.js.
videojs.registerPlugin('ptv', Ptv);

export default Ptv;
