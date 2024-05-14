import OVPService from './ovp-service';
import RequestBuilder from '../../../util/request-builder';
import {BaseEntryResponseProfile} from '../request-params/base-entry-response-profile';

const SERVICE_NAME: string = 'baseEntry';

export default class OVPBaseEntryService extends OVPService {
  /**
   * Creates an instance of RequestBuilder for baseentry.getPlaybackContext
   * @function getPlaybackContext
   * @param {string} serviceUrl The service base URL
   * @param {string} ts The ts
   * @param {serviceEntryId} serviceEntryId The entry id from the request result (to support loading by referenceId)
   * @returns {RequestBuilder} The request builder
   * @static
   */
  public static getPlaybackContext(serviceUrl: string, ts: string, serviceEntryId: string): RequestBuilder {
    const headers: Map<string, string> = new Map();
    headers.set('Content-Type', 'application/json');
    const request = new RequestBuilder(headers);
    request.service = SERVICE_NAME;
    request.action = 'getPlaybackContext';
    request.method = 'POST';
    request.url = request.getUrl(serviceUrl);
    request.tag = 'baseEntry-getPlaybackContext';
    const contextDataParams = {objectType: 'TasvirchiContextDataParams', flavorTags: 'all'};
    request.params = {entryId: serviceEntryId, ts: ts, contextDataParams: contextDataParams};
    return request;
  }

  /**
   * Creates an instance of RequestBuilder for baseentry.list
   * @function list
   * @param {string} serviceUrl The base URL
   * @param {string} ts The ts
   * @param {string} entryId The entry ID
   * @param {boolean} redirectFromEntryId whether the live entry should continue and play the VOD one after the live stream ends.
   * @param {string} referenceId a Reference id instead of an entry id
   * @returns {RequestBuilder} The request builder
   * @static
   */
  public static list(serviceUrl: string, ts: string, entryId: string, redirectFromEntryId: boolean, referenceId: string): RequestBuilder {
    const headers: Map<string, string> = new Map();
    headers.set('Content-Type', 'application/json');
    const request = new RequestBuilder(headers);
    request.service = SERVICE_NAME;
    request.action = 'list';
    request.method = 'POST';
    request.url = request.getUrl(serviceUrl);
    request.tag = 'list';
    request.params = OVPBaseEntryService.getEntryListReqParams(entryId, ts, redirectFromEntryId, referenceId);
    return request;
  }

  /**
   * Gets  baseentry.list service params
   * @function getEntryListReqParams
   * @param {string} entryId The entry ID
   * @param {string} ts The ts
   * @param {boolean} redirectFromEntryId whether the live entry should continue and play the VOD one after the live stream ends.
   * @param {string} referenceId a Reference id instead of an entry id
   * @returns {{ts: string, filter: {redirectFromEntryId: string}, responseProfile: {fields: string, type: number}}} The service params object
   * @static
   */
  public static getEntryListReqParams(entryId: string, ts: string, redirectFromEntryId: boolean, referenceId: string): any {
    let filterParams = {};
    if (entryId) {
      filterParams = redirectFromEntryId ? {redirectFromEntryId: entryId} : {idEqual: entryId};
    } else if (referenceId) {
      filterParams = {objectType: 'TasvirchiBaseEntryFilter', referenceIdEqual: referenceId};
    }

    return {ts: ts, filter: filterParams, responseProfile: new BaseEntryResponseProfile()};
  }
}
