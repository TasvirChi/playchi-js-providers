import ServiceResult from '../../common/base-service-result';
import {TasvirchiAccessControlMessage} from '../../common/response-types/tasvirchi-access-control-message';
import TasvirchiRuleAction from './tasvirchi-rule-action';
import TasvirchiPlaybackSource from './tasvirchi-playback-source';
import TasvirchiBumpersPlaybackPluginData from './tasvirchi-bumper-playback-plugin-data';

export default class TasvirchiPlaybackContext extends ServiceResult {
  public static Type: {[type: string]: string} = {
    DOWNLOAD: 'DOWNLOAD',
    TRAILER: 'TRAILER',
    CATCHUP: 'CATCHUP',
    START_OVER: 'START_OVER',
    PLAYBACK: 'PLAYBACK'
  };
  /**
   * @member - The playback sources
   * @type {Array<TasvirchiPlaybackSource>}
   */
  public sources: Array<TasvirchiPlaybackSource> = [];
  /**
   * @member - Array of actions as received from the rules that invalidated
   * @type {Array<TasvirchiRuleAction>}
   */
  public actions: TasvirchiRuleAction[] = [];
  /**
   * @member - Array of access control massages
   * @type {Array<TasvirchiAccessControlMessage>}
   */
  public messages: Array<TasvirchiAccessControlMessage> = [];
  /**
   * @member - Array of bumper plugins
   * @type {Array<TasvirchiBumpersPlaybackPluginData>}
   */
  public plugins: Array<TasvirchiBumpersPlaybackPluginData> = [];

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
        actions.map(action => this.actions.push(new TasvirchiRuleAction(action)));
      }
      const sources = response.sources;
      if (sources) {
        sources.map(source => this.sources.push(new TasvirchiPlaybackSource(source)));
      }
      const plugins = response.plugins;
      if (plugins) {
        plugins.map(plugin => this.plugins.push(new TasvirchiBumpersPlaybackPluginData(plugin)));
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
}
