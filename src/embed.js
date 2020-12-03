import videojs from 'video.js';
import window from 'global/window';
import { parseMessageData, postMessage } from './postmessage';
import { serialize } from './utils';

const PROTOCOL = 'https://';

const defaultCallbacks = {
  onClickMiss: Function.prototype,
  onConfigReady: Function.prototype
};

const requiredOptions = {
  excludePlayer: true,
  iframe: true
};

const SdkEvents = {
  CLICK_MISS: 'ptv.click.miss',
  CONFIG_FAILURE: 'ptv.config.failure',
  CONFIG_READY: 'ptv.config.ready'
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
    const config = videojs.mergeOptions(options, requiredOptions);
    const origin = PROTOCOL + config.embedHost;

    // Create iFrame.
    const el = window.document.createElement('iframe');

    el.className = 'ptv-iframe';
    el.setAttribute('src', origin + '?' + serialize(config));

    // Store element to instance.
    this.el_ = el;
    this.el_.onload = this.onLoad_.bind(this);

    // Setup origin path for post messaging.
    this.origin_ = origin;

    // Store callbacks from plugin.
    this.callbacks_ = videojs.mergeOptions(defaultCallbacks, callbacks);

    // Setup post message interface.
    window.addEventListener('message', this.handleMessage_.bind(this));

    return this;
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
  }

  /**
   * Hide overlays.
   */
  hide() {
    this.callMethod_('hide');
  }

  /**
   * Stop any running PTV instance and load new config.
   *
   * @param {Object} config Config object passed to ptv.js
   */
  load(config) {
    this.callMethod_('load', config);
  }

  /**
   * Show overlays.
   */
  show() {
    this.callMethod_('show');
  }

  /**
   * Start and show overlays.
   */
  start() {
    this.callMethod_('start');
  }

  /**
   * Stop and hide overlays.
   */
  stop() {
    this.callMethod_('stop');
  }

  /**
   * Update play head.
   *
   * @param {number} seconds Player playhead in seconds.
   */
  timeUpdate(seconds) {
    this.callMethod_('timeUpdate', seconds);
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
   */
  handleMessage_(message) {
    const { data, origin } = message;

    if (origin === this.origin) {
      const payload = parseMessageData(data);

      switch (payload.type) {
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
}

export default PtvEmbed;
