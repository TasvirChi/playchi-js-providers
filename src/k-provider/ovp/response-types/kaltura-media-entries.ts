import ServiceResult from '../../common/base-service-result';
import {TasvirchiMediaEntry} from './tasvirchi-media-entry';

export class TasvirchiMediaEntries extends ServiceResult {
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
      this.entries = [];
      responseObj.map(entry => this.entries.push(new TasvirchiMediaEntry(entry)));
    }
  }
}
