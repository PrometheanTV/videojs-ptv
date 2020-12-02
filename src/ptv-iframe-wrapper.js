/**
 * Class that wraps the iframe element that loads the PTV canvas page and
 * exposes the SDK API to the videojs plugin
 */
class PtvIframeWrapper {
  iframe = undefined;
  constructor(iframe) {
    this.iframe = iframe;
  }

  play() {

  }

  pause() {

  }

  show() {

  }

  hide() {

  }

  on() {

  }

  destroy() {
    this.iframe = null;
  }
}
