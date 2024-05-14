import ServiceResult from '../../common/base-service-result';
import {TasvirchiMetadata} from './tasvirchi-metadata';

export class TasvirchiMetadataListResponse extends ServiceResult {
  public totalCount!: number;
  public metas!: Array<TasvirchiMetadata>;

  /**
   * @constructor
   * @param {Object} responseObj The response
   */
  constructor(responseObj: any) {
    super(responseObj);
    if (!this.hasError) {
      this.totalCount = responseObj.totalCount;
      if (this.totalCount > 0) {
        this.metas = [];
        responseObj.objects.map(meta => this.metas.push(new TasvirchiMetadata(meta)));
      }
    }
  }
}
