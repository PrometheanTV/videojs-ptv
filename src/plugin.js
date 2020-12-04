import videojs from 'video.js';

import PtvEmbed from './embed';
import { ApiHosts, EmbedHosts, PlayerEvents } from './constants';
import { version as VERSION } from '../package.json';

const Plugin = videojs.getPlugin('plugin');

// Default options for the plugin.
const defaults = {
  apiHost: ApiHosts.PRODUCTION,
  channelId: null,
  debug: true,
  domId: null,
  enableGeoBlock: false,
  embedHost: EmbedHosts.PRODUCTION,
  excludePlayer: true,
  iframe: true,
  platformId: null,
  platformName: null,
  platformType: null,
  previewMode: false,
  showDebugPanel: false,
  showPoster: true,
  showTimeUpdate: false,
  streamId: null,
  viewerId: null,
  viewerLatitude: false,
  viewerLongitude: false
};

/**
 * An advanced Video.js plugin. For more information on the API
 *
 * See: https://blog.videojs.com/feature-spotlight-advanced-plugins/
 */
class Ptv extends Plugin {
  /**
   * API hosts static types.
   */
  static get ApiHostType() {
    return Object.assign({}, ApiHosts);
  }

  /**
   * Embed hosts static types.
   */
  static get EmbedHostType() {
    return Object.assign({}, EmbedHosts);
  }

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

    // Setup other player events
    this.addPlayerListeners_();

    // Handle player events.
    this.player.ready(this.handlePlayerReady_.bind(this));
  }

  /**
   * Handles primary player ready event.
   */
  handlePlayerReady_() {
    const callbacks = {
      onClickMiss: this.handleClickMiss_.bind(this),
      onConfigReady: this.handleConfigReady_.bind(this),
      onConfigFailure: this.handleConfigFailure_.bind(this)
    };

    this.player.addClass('vjs-ptv');

    // Create iframe instance.
    this.embed = new PtvEmbed(this.options, callbacks);

    // Place iFrame after video element and before the poster image element.
    this.player.posterImage.el().before(this.embed.el);
  }

  /**
   * Handles clicks that fall through to the root of the iFrame, indicating no
   * overlays were interacted with.
   */
  handleClickMiss_() {
    if (this.player.bigPlayButton && this.player.bigPlayButton.enabled_) {
      this.togglePlay_();
    }
  }

  /**
   * Handles SDK config loaded.
   *
   * @param {Object} response Response from the PTV config API.
   */
  handleConfigFailure_(response) {
    if (this.embed) {
      this.embed.destroy();
    }
  }

  /**
   * Handles SDK config loaded.
   *
   * @param {Object} response Response from the PTV config API.
   */
  handleConfigReady_(response) {
    if (!this.player.paused()) {
      this.start();
    }
  }

  /**
   * Method to toggle play / pause. Used to simulate BigPlayButton behavior when
   * overlays are not interacted with since the iFrame consumes all clicks.
   */
  togglePlay_() {
    if (this.player.paused()) {
      this.player.play();
    } else {
      this.player.pause();
    }
  }

  /**
   * Add videojs player listeners.
   */
  addPlayerListeners_() {
    this.player.one(PlayerEvents.PLAY, () => this.start());
    this.player.on(PlayerEvents.ENDED, () => this.stop());
    this.player.on(PlayerEvents.ERROR, () => this.stop());
    this.player.on(PlayerEvents.PAUSE, () => this.hide());
    this.player.on(PlayerEvents.PLAY, () => this.show());
    this.player.on(PlayerEvents.TIME_UPDATE, () =>
      this.timeUpdate(this.player.currentTime()));
  }

  /**
   * Remove videojs player listeners.
   */
  removePlayerListeners_() {
    this.player.off([
      PlayerEvents.ENDED,
      PlayerEvents.ERROR,
      PlayerEvents.PAUSE,
      PlayerEvents.PLAY,
      PlayerEvents.TIME_UPDATE
    ]);
  }

  // //////////////////////////
  // Public API
  //
  // NOTE: These need to remain for now to have parity with the SDK API.

  /**
   * Hide overlays.
   */
  hide() {
    if (this.embed) {
      this.embed.hide();
    }
  }

  /**
   * Stop any running PTV instance and load new config.
   *
   * @param {Object} config Config object passed to ptv.js
   */
  load(config) {
    if (this.embed) {
      this.embed.load(config);
    }
  }

  /**
   * Event emitter `off` method.
   *
   * @param {string} eventName Event name.
   */
  off() {
    if (this.embed) {
      this.embed.off();
    }
  }

  /**
   * Event emitter `on` method.
   *
   * @param {string} eventName Event name.
   */
  on(eventName) {
    if (this.embed) {
      this.embed.on(eventName);
    }
  }

  /**
   * Event emitter `once` method.
   *
   * @param {string} eventName Event name.
   */
  once(eventName) {
    if (this.embed) {
      this.embed.once(eventName);
    }
  }

  /**
   * Event emitter `removeAllListeners` method.
   *
   * @param {Array} eventNames Array of event names.
   */
  removeAllListeners(eventNames) {
    if (this.embed) {
      this.embed.removeAllListeners(eventNames);
    }
  }

  /**
   * Show overlays.
   */
  show() {
    if (this.embed) {
      this.embed.show();
    }
  }

  /**
   * Start and show overlays.
   */
  start() {
    if (this.embed) {
      this.embed.start();
    }
  }

  /**
   * Stop and hide overlays.
   */
  stop() {
    if (this.embed) {
      this.embed.stop();
    }
  }

  /**
   * Update play head.
   *
   * @param {number} seconds Player playhead in seconds.
   */
  timeUpdate(seconds) {
    if (this.embed) {
      this.embed.timeUpdate(seconds);
    }
  }
}

// Define default values for the plugin's `state` object here.
Ptv.defaultState = {};

// Include the version number.
Ptv.VERSION = VERSION;

// Register the plugin with video.js.
videojs.registerPlugin('ptv', Ptv);

export default Ptv;
