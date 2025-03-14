export class TasvirchiUserEntry {
  /**
   * @member - The last played playlist entry
   * @type {string}
   */
  public playlistLastEntryId: string;
  /**
   * @member - The entry referenceId
   * @type {string}
   */
  private entryId: string;
  /**
   * @member - The entry id
   * @type {number}
   */
  private id: number;
  /**
   * @member - username
   * @type {string}
   */
  private userId: string;
  /**
   * @member - partner id
   * @type {number}
   */
  private partnerId: number;
  /**
   * @member - entry status
   * @type {number}
   */
  private status: number;
  /**
   * @member - Entry creation date as Unix timestamp (In seconds)
   * @type {number}
   */
  private createdAt: number;
  /**
   * @member - Entry updation date as Unix timestamp (In seconds)
   * @type {number}
   */
  private updatedAt: number;

  /**
   * @constructor
   * @param {Object} entry The json response
   */
  constructor(entry: any) {
    this.playlistLastEntryId = entry.playlistLastEntryId;
    this.entryId = entry.entryId;
    this.id = entry.id;
    this.userId = entry.userId;
    this.partnerId = entry.partnerId;
    this.status = entry.status;
    this.createdAt = entry.createdAt;
    this.updatedAt = entry.updatedAt;
  }
}
