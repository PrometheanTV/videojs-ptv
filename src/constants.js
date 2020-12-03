/**
 * API hosts.
 */
export const ApiHosts = Object.freeze({
  COMDEV: 'comdev.broadcast.promethean.tv',
  QA: 'qa.broadcast.promethean.tv',
  STAGING: 'staging.broadcast.promethean.tv',
  PRODUCTION: 'broadcast.promethean.tv'
});

/**
 * Embed hosts.
 */
export const EmbedHosts = Object.freeze({
  COMDEV: 'comdev.embed.promethean.tv',
  QA: 'qa.embed.promethean.tv',
  STAGING: 'staging.embed.promethean.tv',
  PRODUCTION: 'embed.promethean.tv'
});

/**
 * Player events.
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
 */
export const SdkEvents = Object.freeze({
  CLICK_MISS: 'ptv.click.miss',
  CONFIG_FAILURE: 'ptv.config.failure',
  CONFIG_READY: 'ptv.config.ready'
});
