import videojs from 'video.js';
import window from 'global/window';

import PtvEmbed from './embed';
import {
  ApiHosts,
  EmbedHosts,
  PlatformNames,
  PlatformTypes,
  PlayerEvents
} from './constants';
import { version as VERSION } from '../package.json';

const Plugin = videojs.getPlugin('plugin');

// Default options for the plugin.
const defaults = {
  apiHost: ApiHosts.PRODUCTION,
  channelId: null,
  debug: false,
  enableGeoBlock: false,
  embedHost: EmbedHosts.PRODUCTION,
  platformId: null,
  platformName: null,
  platformType: null,
  previewMode: false,
  showDebugPanel: false,
  showPoster: false,
  streamId: null,
  viewerId: null,
  viewerLatitude: null,
  viewerLongitude: null
};

const defaultState = {
  configReady: false,
  configFailure: false
};

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

    this.setState(defaultState);
    // An object that stores any state that gets changed before `this.embed` is
    // ready
    this.preloadState = {
      started: undefined,
      visible: undefined,
      time: -1,
    }

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
    if (this.preloadState.started) {
      this.embed.start();
    } else if(this.preloadState.started === false) {
      this.embed.stop();
    }
    if (this.preloadState.visible) {
      this.embed.show();
    } else if (this.preloadState.visible === false) {
      this.embed.hide();
    }
    if(this.preloadState.time !== -1) {
      this.embed.timeUpdate(this.preloadState.time);
    }

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
   * Handles SDK config failure.
   */
  handleConfigFailure_() {
    this.setState({ configFailure: true });

    if (this.embed) {
      this.embed.destroy();
    }
  }

  /**
   * Handles SDK config loaded.
   *
   * @param {Object}  data Response from the PTV config API.
   * @param {boolean} data.poster Poster set in the Promethean Ignite Video Platform.
   * @param {string}  data.src Video source set in the Promethean Ignite Video Platform.
   * @param {string}  data.type Video type set in the Promethean Ignite Video Platform.
   */
  handleConfigReady_({ poster, src, type }) {
    this.setState({ configReady: true });

    // Start SDK if video already playing.
    if (!this.player.paused()) {
      this.start();
    }

    // Use poster from API.
    if (this.options.showPoster && typeof poster === 'object') {
      this.player.poster(poster.loading);
    }

    // Use video from API, if no video started.
    if (!this.player.src() && this.player.canPlayType(type)) {
      this.player.src(src);
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

  /**
   * Dispose the plugin
   */
  dispose() {
    this.removePlayerListeners_();
    if (this.embed) {
      this.embed.dispose();
    }
    super.dispose();
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
    } else {
      this.preloadState.visible = false;
    }
  }

  /**
   * Stop any running PTV instance and load new config.
   *
   * @param {Object} config Config object passed to ptv.js
   */
  load(config) {
    this.setState(defaultState);

    if (this.embed) {
      this.embed.load(config);
    }
  }

  /**
   * Show overlays.
   */
  show() {
    if (this.embed) {
      this.embed.show();
    } else {
      this.preloadState.visible = true;
    }
  }

  /**
   * Start and show overlays.
   */
  start() {
    if (this.embed) {
      this.embed.start();
    } else {
      this.preloadState.started = true;
    }
  }

  /**
   * Stop and hide overlays.
   */
  stop() {
    if (this.embed) {
      this.embed.stop();
    } else {
      this.preloadState.started = false;
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
    } else {
      this.preloadState.time = seconds;
    }
  }
}

// Define default values for the plugin's `state` object here.
Ptv.defaultState = defaultState;

// Include the version number.
Ptv.VERSION = VERSION;

// Register the plugin with video.js.
videojs.registerPlugin('ptv', Ptv);

// Create and export static types.
export const PtvTypes = (window.PtvTypes = {
  ApiHosts,
  EmbedHosts,
  PlatformNames,
  PlatformTypes
});

export default Ptv;
