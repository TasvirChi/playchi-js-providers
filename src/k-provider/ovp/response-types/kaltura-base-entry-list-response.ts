import ServiceResult from '../../common/base-service-result';
import {TasvirchiMediaEntry} from './tasvirchi-media-entry';

export class TasvirchiBaseEntryListResponse extends ServiceResult {
  /**
   * @member - The total count
   * @type {number}
   */
  public totalCount!: number;
  /**
   * @member - The entries
   * @type {Array<TasvirchiMediaEntry>}
   */
  public entries!: Array<TasvirchiMediaEntry>;

  /**
   * @constructor
   * @param {Object} responseObj The json response
   */
  constructor(responseObj: any) {
    super(responseObj);
    if (!this.hasError) {
      this.totalCount = responseObj.totalCount;
      if (this.totalCount > 0) {
        this.entries = [];
        responseObj.objects.map(entry => this.entries.push(new TasvirchiMediaEntry(entry)));
      }
    }
  }
}
