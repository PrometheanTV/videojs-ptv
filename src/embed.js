import videojs from 'video.js';
import window from 'global/window';

import { SdkEvents } from './constants';
import { parseMessageData, postMessage } from './postmessage';
import { serialize } from './utils';

const PROTOCOL = 'https://';

const defaultCallbacks = {
  onClickMiss: Function.prototype,
  onConfigFailure: Function.prototype,
  onConfigReady: Function.prototype
};

const requiredOptions = {
  embedHost: null,
  excludePlayer: true,
  iframe: true
};

const createDefaultPreloadState = () => ({
  config: undefined,
  started: undefined,
  visible: undefined,
  time: -1
});

/**
 * Class that wraps the iframe element that loads the PTV canvas page and
 * exposes the SDK API to the videojs plugin.
 */
class PtvEmbed {
  /**
   * We make the actual assignment of the iframe source a static function to allow
   * tests to easily override the implementation (e.g., to set some custom
   * iframe content).
   *
   * @param {HTMLIframeElement} el The iframe DOM element
   * @param {string} origin The origin of the iframe content
   * @param {Object} config The SDK config to be passed as URL params to the SDK
   */
  static assignIframeSource(el, origin, config) {
    el.setAttribute('src', origin + '?' + serialize(config));
  }

  /**
   * This static function is overriden in tests when mock iframe content is set
   * via `PtvEmbed.assignIframeSource`.
   *
   * @param {Object} options Embed options.
   * @return {string} Returns full-qualified embed host URL.
   */
  static getOrigin(options) {
    return PROTOCOL + options.embedHost;
  }

  /**
   * Main constructor function.
   *
   * @param {Object} options Embed options to be serialized.
   * @param {Object} callbacks Map of callback events to execute on message
   * @param {string} iframeContent The optional content for the iframe (useful for tests)
   *  received.
   */
  constructor(options, callbacks) {
    // Initialize private instance properties.
    this.isSdkLoaded_ = false;
    this.preloadState_ = createDefaultPreloadState();

    // Generate config options.
    this.config_ = videojs.mergeOptions(options, requiredOptions);
    this.origin_ = PtvEmbed.getOrigin(options);

    // Create iFrame element.
    this.el_ = window.document.createElement('iframe');
    this.el_.onload = this.onLoad_.bind(this);
    this.el_.className = 'ptv-iframe';
    this.el_.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      max-width: 100%;
      max-height: 100%;
      border: none;
    `;

    // Assign iframe source to embed.
    PtvEmbed.assignIframeSource(this.el_, this.origin_, this.config_);

    // Store callbacks from plugin.
    this.callbacks_ = videojs.mergeOptions(defaultCallbacks, callbacks);

    // Setup post message interface.
    this.handleMessage_ = this.handleMessage_.bind(this);
    window.addEventListener('message', this.handleMessage_);
  }

  /**
   * Dispose the embed
   */
  dispose() {
    window.removeEventListener('message', this.handleMessage_);
    this.callbacks_ = defaultCallbacks;
  }

  /**
   * Callbacks getter
   *
   * @return {Object} Map of event callbacks.
   */
  get callbacks() {
    return this.callbacks_;
  }

  /**
   * Element getter
   *
   * @return {HTMLIFrameElement} Map of event callbacks.
   */
  get el() {
    return this.el_;
  }

  /**
   * Origin getter
   *
   * @return {Object} Origin of embed.
   */
  get origin() {
    return this.origin_;
  }

  /**
   * Destroy instance and remove iframe element.
   */
  destroy() {
    this.el.parentNode.removeChild(this.el);
    this.el_ = null;
    this.isSdkLoaded_ = undefined;
  }

  /**
   * Hide overlays.
   */
  hide() {
    if (this.isSdkLoaded_) {
      this.callMethod_('hide');
    } else {
      this.preloadState_.visible = false;
    }
  }

  /**
   * Stop any running PTV instance and load new config.
   *
   * @param {Object} config Config object passed to ptv.js
   */
  load(config) {
    if (this.isSdkLoaded_) {
      this.callMethod_('load', config);
    } else {
      this.preloadState_.config = config;
    }
  }

  /**
   * Event emitter `off` method.
   *
   * @param {string} eventName Event name.
   */
  off(eventName) {
    this.callMethod_('off', eventName);
  }

  /**
   * Event emitter `on` method.
   *
   * @param {string} eventName Event name.
   */
  on(eventName) {
    this.callMethod_('on', eventName);
  }

  /**
   * Event emitter `once` method.
   *
   * @param {string} eventName Event name.
   */
  once(eventName) {
    this.callMethod_('once', eventName);
  }

  /**
   * Event emitter `removeAllListeners` method.
   *
   * @param {Array} eventNames Array of event names.
   */
  removeAllListeners(eventNames) {
    this.callMethod_('removeAllListeners', eventNames);
  }

  /**
   * Show overlays.
   */
  show() {
    if (this.isSdkLoaded_) {
      this.callMethod_('show');
    } else {
      this.preloadState_.visible = true;
    }
  }

  /**
   * Start and show overlays.
   */
  start() {
    if (this.isSdkLoaded_) {
      this.callMethod_('start');
    } else {
      this.preloadState_.started = true;
    }
  }

  /**
   * Stop and hide overlays.
   */
  stop() {
    if (this.isSdkLoaded_) {
      this.callMethod_('stop');
    } else {
      this.preloadState_.started = false;
    }
  }

  /**
   * Update play head.
   *
   * @param {number} seconds Player playhead in seconds.
   */
  timeUpdate(seconds) {
    if (this.isSdkLoaded_) {
      this.callMethod_('timeUpdate', seconds);
    } else {
      this.preloadState_.time = seconds;
    }
  }

  /**
   * Get a promise for a method.
   *
   * @param {string} name The API method to call.
   * @param {*} args Arguments to send via postMessage.
   * @todo We should consider making this promised based.
   * @private
   */
  callMethod_(name, args) {
    postMessage(this, name, args);
  }

  /**
   * Handles clicks that fall through to the root of the iFrame, indicating no
   * overlays were interacted with.
   *
   * @param {Object} message Message sent from iframe postMessage.
   * @private
   */
  handleMessage_(message) {
    const { data, origin } = message;

    if (origin === this.origin_) {
      const payload = parseMessageData(data);

      // If we receive any kind of message then we know the SDK has loaded.
      if(!this.isSdkLoaded_) {
        this.isSdkLoaded_ = true;
        this.applyPreloadState_();
      }

      switch (payload.type) {
      case SdkEvents.CONFIG_FAILURE:
        this.callbacks.onConfigFailure();
        break;

      case SdkEvents.CONFIG_READY:
        this.callbacks.onConfigReady(payload.data);
        break;

      case SdkEvents.CLICK_MISS:
        this.callbacks.onClickMiss();
        break;

      default:
        return;
      }
    }
  }

  /**
   * Handle iFrame onload event. Destroys instance if any errors occur.
   *
   * @todo This should be comprehensive to avoid any negative side-effects.
   * @private
   */
  onLoad_() {
    try {
      if (this.el.contentDocument.body.innerText === 'NOT FOUND') {
        this.destroy();
      }
    } catch (e) {
      // Could log this error, if needed.
    }
  }

  /**
   * Applies any state changes that occurred before the SDK was ready.
   *
   * @private
   */
  applyPreloadState_() {
    const { config, started, time, visible } = this.preloadState_;

    if (!this.isSdkLoaded_) {
      return;
    }

    if (config) {
      this.load(config);
    }

    if (started === true) {
      this.start();
    }

    if (started === false) {
      this.stop();
    }

    if (visible === true) {
      this.show();
    }

    if (visible === false) {
      this.hide();
    }

    if (time > -1) {
      this.timeUpdate(time);
    }

    // Revert properties to defaults.
    this.preloadState_ = createDefaultPreloadState();
  }
}

export default PtvEmbed;
