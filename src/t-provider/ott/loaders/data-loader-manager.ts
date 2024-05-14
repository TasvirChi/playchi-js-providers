import DataLoaderManager from '../../common/data-loader-manager';
import OTTService from '../services/ott-service';
import {ProviderNetworkRetryParameters} from '../../../types';
/**
 * OTTDataLoaderManager is a class that handles the OTT data loading
 * @param {string} partnerId - partner id
 * @param {string} ts - ts
 * @param {ProviderNetworkRetryParameters} [networkRetryConfig] - network retry configuration
 */
export default class OTTDataLoaderManager extends DataLoaderManager {
  constructor(partnerId: number, ts: string = '', networkRetryConfig: ProviderNetworkRetryParameters) {
    super(networkRetryConfig);
    this._multiRequest = OTTService.getMultiRequest(ts, partnerId);
  }
}
