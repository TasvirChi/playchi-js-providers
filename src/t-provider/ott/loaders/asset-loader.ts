import OTTAssetService from '../services/asset-service';
import OTTConfiguration from '../config';
import RequestBuilder from '../../../util/request-builder';
import TasvirchiPlaybackContext from '../response-types/tasvirchi-playback-context';
import TasvirchiAsset from '../response-types/tasvirchi-asset';
import {ILoader} from '../../../types';

type OTTAssetLoaderResponse = {mediaDataResult: TasvirchiAsset, playBackContextResult: TasvirchiPlaybackContext};
export type {OTTAssetLoaderResponse};

export default class OTTAssetLoader implements ILoader {
  private _entryId: string;
  private _requests!: Array<RequestBuilder>;
  private _response: any = {};

  public static get id(): string {
    return 'asset';
  }

  /**
   * @constructor
   * @param {Object} params loader params
   */
  constructor(params: any) {
    this.requests = this.buildRequests(params);
    this._entryId = params.entryId;
  }

  public set requests(requests: Array<RequestBuilder>) {
    this._requests = requests;
  }

  public get requests(): Array<RequestBuilder> {
    return this._requests;
  }

  public set response(response: any) {
    this._response.mediaDataResult = new TasvirchiAsset(response[0].data);
    this._response.playBackContextResult = new TasvirchiPlaybackContext(response[1].data);
  }

  public get response(): OTTAssetLoaderResponse {
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
    const config = OTTConfiguration.get();
    const requests: Array<RequestBuilder> = [];
    requests.push(OTTAssetService.get(config.serviceUrl, params.ts, params.entryId, params.assetReferenceType));
    requests.push(OTTAssetService.getPlaybackContext(config.serviceUrl, params.ts, params.entryId, params.type, params.playbackContext));
    return requests;
  }

  /**
   * Loader validation function
   * @function
   * @returns {boolean} Is valid
   */
  public isValid(): boolean {
    return !!this._entryId;
  }
}
