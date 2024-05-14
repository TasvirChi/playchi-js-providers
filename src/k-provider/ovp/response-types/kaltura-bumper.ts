import {TasvirchiPlaybackSource} from './tasvirchi-playback-source';

export class TasvirchiBumper {
  /**
   * @member - The bumper entry ID
   * @type {string}
   */
  public entryId: string;
  /**
   * @member - The bumper click through url
   * @type {string}
   */
  public clickThroughUrl: string;
  /**
   * @member - The bumper sources
   * @type {Array<TasvirchiPlaybackSource>}
   */
  public sources: Array<TasvirchiPlaybackSource>;

  constructor(data: any) {
    this.entryId = data.entryId;
    this.clickThroughUrl = data.url;
    this.sources = data.sources ? data.sources.map(source => new TasvirchiPlaybackSource(source)) : [];
  }
}
