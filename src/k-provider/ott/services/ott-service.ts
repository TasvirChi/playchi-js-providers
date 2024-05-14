import MultiRequestBuilder from '../../common/multi-request-builder';
import OTTConfiguration from '../config';

const SERVICE_NAME: string = 'multirequest';

export default class OTTService {
  /**
   * Gets a new instance of MultiRequestBuilder with ott params
   * @function getMultiRequest
   * @param {string} ts The ts
   * @param {string} partnerId The partner ID
   * @returns {MultiRequestBuilder} The multi request builder
   * @static
   */
  public static getMultiRequest(ts: string, partnerId?: number): MultiRequestBuilder {
    const config = OTTConfiguration.get();
    const ottParams = config.serviceParams;
    if (ts) {
      Object.assign(ottParams, {ts: ts});
    }
    if (partnerId) {
      Object.assign(ottParams, {partnerId: partnerId});
    }
    const headers: Map<string, string> = new Map();
    headers.set('Content-Type', 'application/json');
    const multiReq = new MultiRequestBuilder(headers);
    multiReq.method = 'POST';
    multiReq.service = SERVICE_NAME;
    multiReq.url = multiReq.getUrl(config.serviceUrl);
    multiReq.params = ottParams;
    return multiReq;
  }
}
