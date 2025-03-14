import RequestBuilder from '../../../util/request-builder';
import OVPBaseEntryService from '../services/base-entry-service';
import OVPMetadataService from '../services/meta-data-service';
import OVPConfiguration from '../config';
import {TasvirchiPlaybackContext} from '../response-types';
import {TasvirchiMetadataListResponse} from '../response-types';
import {TasvirchiBaseEntryListResponse} from '../response-types';
import {TasvirchiMediaEntry} from '../response-types';
import {ILoader} from '../../../types';

type OVPMediaEntryLoaderResponse = {
  entry: TasvirchiMediaEntry,
  playBackContextResult: TasvirchiPlaybackContext,
  metadataListResult: TasvirchiMetadataListResponse
};
export type {OVPMediaEntryLoaderResponse};

export default class OVPMediaEntryLoader implements ILoader {
  private _entryId: string;
  private _referenceId: string;
  private _requests!: Array<RequestBuilder>;
  private _response: any = {};

  public static get id(): string {
    return 'media';
  }

  /**
   * @constructor
   * @param {Object} params loader params
   * @boolean {boolean} useExternalCaptions - if we should add captions request to the multirequests.
   */
  constructor(params: any) {
    this.requests = this.buildRequests(params);
    this._entryId = params.entryId;
    this._referenceId = params.referenceId;
  }

  public set requests(requests: Array<RequestBuilder>) {
    this._requests = requests;
  }

  public get requests(): Array<RequestBuilder> {
    return this._requests;
  }

  public set response(response: any) {
    const mediaEntryResponse: TasvirchiBaseEntryListResponse = new TasvirchiBaseEntryListResponse(response[0].data);
    this._response.entry = mediaEntryResponse.entries[0];
    this._response.playBackContextResult = new TasvirchiPlaybackContext(response[1].data);
    this._response.metadataListResult = new TasvirchiMetadataListResponse(response[2].data);
  }

  public get response(): OVPMediaEntryLoaderResponse {
    return this._response;
  }

  /**
   * Builds loader requests
   * @function
   * @param {Object} params Requests parameters
   * @returns {RequestBuilder} The request builder
   * @static
   */
  public buildRequests(params: any): Array<RequestBuilder> {
    const config = OVPConfiguration.get();
    const requests: Array<RequestBuilder> = [];
    requests.push(OVPBaseEntryService.list(config.serviceUrl, params.ts, params.entryId, params.redirectFromEntryId, params.referenceId));
    // Use the entry id from the request result to support loading by referenceId
    const serviceEntryId = params.ts === '{1:result:ts}' ? '{2:result:objects:0:id}' : '{1:result:objects:0:id}';
    requests.push(OVPBaseEntryService.getPlaybackContext(config.serviceUrl, params.ts, serviceEntryId));
    requests.push(OVPMetadataService.list(config.serviceUrl, params.ts, serviceEntryId));
    return requests;
  }

  /**
   * Loader validation function
   * @function
   * @returns {boolean} Is valid
   */
  public isValid(): boolean {
    return !!(this._entryId || this._referenceId);
  }
}
