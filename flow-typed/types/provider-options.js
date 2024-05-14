// @flow
import {LoggerType} from '../../src/util/logger';

declare type ProviderOptionsObject = {
  partnerId: number,
  widgetId?: string,
  logger?: LoggerType,
  ts?: string,
  uiConfId?: number,
  env?: ProviderEnvConfigObject,
  networkRetryParameters?: ProviderNetworkRetryParameters,
  filterOptions?: ProviderFilterOptionsObject,
  ignoreServerConfig?: boolean,
  loadThumbnailWithTs?: boolean
};
