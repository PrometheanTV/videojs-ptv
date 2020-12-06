/**
 * API hosts.
 * @typedef {Object} ApiHosts
 * @enum
 */
export const ApiHosts = Object.freeze({
  COMDEV: 'comdev.broadcast.promethean.tv',
  QA: 'qa.broadcast.promethean.tv',
  STAGING: 'staging.broadcast.promethean.tv',
  PRODUCTION: 'broadcast.promethean.tv'
});

/**
 * Embed hosts.
 * @typedef {Object} EmbedHosts
 * @enum
 */
export const EmbedHosts = Object.freeze({
  COMDEV: 'comdev.embed.promethean.tv',
  QA: 'qa.embed.promethean.tv',
  STAGING: 'staging.embed.promethean.tv',
  PRODUCTION: 'embed.promethean.tv'
});

/**
 * Platform names.
 * @typedef {Object} PlatformNames
 * @enum
 */
export const PlatformNames = Object.freeze({
  TRUE: 'truetv'
});

/**
 * Platform types.
 * @typedef {Object} PlatformTypes
 * @enum
 */
export const PlatformTypes = Object.freeze({
  CMS_ID: 'cmsid'
});

/**
 * Player events.
 * @typedef {Object} PlayerEvents
 * @enum
 */
export const PlayerEvents = Object.freeze({
  ENDED: 'ended',
  ERROR: 'error',
  PAUSE: 'pause',
  PLAY: 'play',
  TIME_UPDATE: 'timeupdate'
});

/**
 * PTV SDK events.
 * @typedef {Object} SdkEvents
 * @enum
 */
export const SdkEvents = Object.freeze({
  CLICK_MISS: 'ptv.click.miss',
  CONFIG_FAILURE: 'ptv.config.failure',
  CONFIG_READY: 'ptv.config.ready'
});
