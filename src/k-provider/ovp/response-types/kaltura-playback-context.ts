import ServiceResult from '../../common/base-service-result';
import {TasvirchiAccessControlMessage} from '../../common/response-types/tasvirchi-access-control-message';
import {TasvirchiPlaybackSource} from './tasvirchi-playback-source';
import {TasvirchiAccessControlModifyRequestHostRegexAction} from './tasvirchi-access-control-modify-request-host-regex-action';
import {TasvirchiRuleAction} from './tasvirchi-rule-action';
import {TasvirchiFlavorAsset} from './tasvirchi-flavor-asset';
import {TasvirchiBumper} from './tasvirchi-bumper';

export class TasvirchiPlaybackContext extends ServiceResult {
  /**
   * @member - The playback sources
   * @type {Array<TasvirchiPlaybackSource>}
   */
  public sources: Array<TasvirchiPlaybackSource> = [];
  /**
   * @member - Array of actions as received from the rules that invalidated
   * @type {Array<TasvirchiRuleAction>}
   */
  public actions: Array<TasvirchiRuleAction> = [];
  /**
   * @member - Array of actions as received from the rules that invalidated
   * @type {Array<TasvirchiAccessControlMessage>}
   */
  public messages: Array<TasvirchiAccessControlMessage> = [];
  /**
   * @member - The flavor assets
   * @type {Array<TasvirchiFlavorAsset>}
   */
  public flavorAssets: Array<TasvirchiFlavorAsset> = [];
  /**
   * @member - The bumper data
   * @type {Array<TasvirchiBumper>}
   */
  public bumperData: Array<TasvirchiBumper> = [];

  /**
   * @constructor
   * @param {Object} response The response
   */
  constructor(response: any) {
    super(response);
    if (!this.hasError) {
      const messages = response.messages;
      if (messages) {
        messages.map(message => this.messages.push(new TasvirchiAccessControlMessage(message)));
      }
      const actions = response.actions;
      if (actions) {
        actions.map(action => {
          if (action.type === TasvirchiRuleAction.Type.REQUEST_HOST_REGEX) {
            this.actions.push(new TasvirchiAccessControlModifyRequestHostRegexAction(action));
          } else {
            this.actions.push(new TasvirchiRuleAction(action));
          }
        });
      }
      const sources = response.sources;
      if (sources) {
        sources.map(source => this.sources.push(new TasvirchiPlaybackSource(source)));
      }
      const flavorAssets = response.flavorAssets;
      if (flavorAssets) {
        flavorAssets.map(flavor => this.flavorAssets.push(new TasvirchiFlavorAsset(flavor)));
      }
      const bumperData = response.bumperData;
      if (bumperData) {
        bumperData.map(bumper => this.bumperData.push(new TasvirchiBumper(bumper)));
      }
    }
  }

  public hasBlockAction(): boolean {
    return this.getBlockAction() !== undefined;
  }

  public getBlockAction(): TasvirchiRuleAction | undefined {
    return this.actions.find(action => action.type === TasvirchiRuleAction.Type.BLOCK);
  }

  public getErrorMessages(): Array<TasvirchiAccessControlMessage> {
    return this.messages;
  }

  /**
   * Get the TasvirchiAccessControlModifyRequestHostRegexAction action
   * @function getRequestHostRegexAction
   * @returns {?TasvirchiAccessControlModifyRequestHostRegexAction} The action
   * */
  public getRequestHostRegexAction(): TasvirchiAccessControlModifyRequestHostRegexAction | undefined {
    const action = this.actions.find(action => action.type === TasvirchiRuleAction.Type.REQUEST_HOST_REGEX);
    if (action instanceof TasvirchiAccessControlModifyRequestHostRegexAction) {
      return action;
    }
  }
}
