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

/**
 * Class that wraps the iframe element that loads the PTV canvas page and
 * exposes the SDK API to the videojs plugin.
 */
class PtvEmbed {
  /**
   * Main constructor function.
   *
   * @param {Object} options Embed options to be serialized.
   * @param {Object} callbacks Map of callback events to execute on message
   *  received.
   * @return {PtvEmbed} Instance of PtvEmbed
   */
  constructor(options, callbacks) {
    // flag that tells us if we have received SDK_READY message
    this.ready = false;

    this.preloadState = {
      config: undefined,
      started: undefined,
      visible: undefined,
      time: -1
    }

    const config = videojs.mergeOptions(options, requiredOptions);
    const origin = PROTOCOL + options.embedHost;

    // Create iFrame.
    const el = window.document.createElement('iframe');

    el.className = 'ptv-iframe';
    el.setAttribute('src', origin + '?' + serialize(config));

    // Set iFrame CSS styles.
    el.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      max-width: 100%;
      max-height: 100%;
      border: none;
    `;

    // Store element to instance.
    this.el_ = el;
    this.el_.onload = this.onLoad_.bind(this);

    // Setup origin path for post messaging.
    this.origin_ = origin;

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
    this.ready = undefined;
  }

  /**
   * Hide overlays.
   */
  hide() {
    if(this.ready) {
      this.callMethod_('hide');
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
    if (this.ready) {
      this.callMethod_('load', config);
    } else {
      this.preloadState.config = config;
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
    if(this.ready) {
      this.callMethod_('show');
    } else {
      this.preloadState.visible = true;
    }
  }

  /**
   * Start and show overlays.
   */
  start() {
    if(this.ready) {
      this.callMethod_('start');
    } else {
      this.preloadState.started = true;
    }

  }

  /**
   * Stop and hide overlays.
   */
  stop() {
    if(this.ready) {
      this.callMethod_('stop');
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
    if(this.ready) {
      this.callMethod_('timeUpdate', seconds);
    } else {
      this.preloadState.time = seconds;
    }

  }

  /**
   * Get a promise for a method.
   *
   * @param {string} name The API method to call.
   * @param {Object} [args={}] Arguments to send via postMessage.
   * @todo We should consider making this promised based.
   */
  callMethod_(name, args = {}) {
    postMessage(this, name, args);
  }

  /**
   * Handles clicks that fall through to the root of the iFrame, indicating no
   * overlays were interacted with.
   *
   * @param {Object} message Message sent from iframe postMessage.
   */
  handleMessage_(message) {
    const { data, origin } = message;
    if (origin === this.origin_) {
      const payload = parseMessageData(data);

      switch (payload.type) {
      case SdkEvents.CONFIG_FAILURE:
        this.callbacks.onConfigFailure();
        break;

      case SdkEvents.CONFIG_READY:
        this.ready = true;
        this.applyPreloadState()
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

  applyPreloadState() {
    if (!this.ready) return;
    if (this.preloadState.config) this.load(this.preloadState.config);
    if (this.preloadState.started) this.start();
    else if (this.preloadState.started === false) this.stop();
    if (this.preloadState.visible) this.show()
    else if (this.preloadState.visible === false) this.hide();
    if (this.preloadState.time > -1) this.timeUpdate(this.preloadState.time);
    this.preloadState = {};
  }
}

export default PtvEmbed;
