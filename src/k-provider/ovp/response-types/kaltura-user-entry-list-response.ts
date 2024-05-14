import ServiceResult from '../../common/base-service-result';
import {TasvirchiUserEntry} from './tasvirchi-user-entry';

export class TasvirchiUserEntryListResponse extends ServiceResult {
  /**
   * @member - The total count
   * @type {number}
   */
  private totalCount!: number;
  /**
   * @member - The entries
   * @type {Array<TasvirchiUserEntry>}
   */
  private entries!: Array<TasvirchiUserEntry>;

  /**
   * @constructor
   * @param {Object} responseObj The json response
   */
  constructor(responseObj: any) {
    super(responseObj);
    if (!this.hasError) {
      this.totalCount = responseObj.totalCount;
      this.entries = [];
      if (this.totalCount > 0) {
        responseObj.objects.map(entry => this.entries.push(new TasvirchiUserEntry(entry)));
      }
    }
  }
}
