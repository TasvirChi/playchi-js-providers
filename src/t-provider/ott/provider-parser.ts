import getLogger from '../../util/logger';
import TasvirchiPlaybackSource from './response-types/tasvirchi-playback-source';
import TasvirchiPlaybackContext from './response-types/tasvirchi-playback-context';
import TasvirchiAsset from './response-types/tasvirchi-asset';
import MediaEntry from '../../entities/media-entry';
import Drm from '../../entities/drm';
import MediaSource from '../../entities/media-source';
import MediaSources from '../../entities/media-sources';
import EntryList from '../../entities/entry-list';
import Bumper from '../../entities/bumper';
import {SupportedStreamFormat, isProgressiveSource} from '../../entities/media-format';
import {TasvirchiDrmPlaybackPluginData} from '../common/response-types/tasvirchi-drm-playback-plugin-data';
import TasvirchiRuleAction from './response-types/tasvirchi-rule-action';
import {TasvirchiAccessControlMessage} from '../common/response-types/tasvirchi-access-control-message';
import type {OTTAssetLoaderResponse} from './loaders/asset-loader';
import TasvirchiBumpersPlaybackPluginData from './response-types/tasvirchi-bumper-playback-plugin-data';
import {ProviderMediaInfoObject, Poster} from '../../types';

const LIVE_ASST_OBJECT_TYPE: string = 'TasvirchiLiveAsset';

const MediaTypeCombinations: {[mediaType: string]: any} = {
  [TasvirchiAsset.Type.MEDIA]: {
    [TasvirchiPlaybackContext.Type.TRAILER]: () => ({type: MediaEntry.Type.VOD}),
    [TasvirchiPlaybackContext.Type.PLAYBACK]: mediaAssetData => {
      if (mediaAssetData.objectType === LIVE_ASST_OBJECT_TYPE) {
        return {type: MediaEntry.Type.LIVE, dvrStatus: mediaAssetData.enableTrickPlay ? MediaEntry.DvrStatus.ON : MediaEntry.DvrStatus.OFF};
      } else if (parseInt(mediaAssetData.externalIds) > 0) {
        return {type: MediaEntry.Type.LIVE, dvrStatus: MediaEntry.DvrStatus.OFF};
      }
      return {type: MediaEntry.Type.VOD};
    }
  },
  [TasvirchiAsset.Type.EPG]: {
    [TasvirchiPlaybackContext.Type.CATCHUP]: () => ({type: MediaEntry.Type.VOD}),
    [TasvirchiPlaybackContext.Type.START_OVER]: () => ({type: MediaEntry.Type.LIVE, dvrStatus: MediaEntry.DvrStatus.ON})
  },
  [TasvirchiAsset.Type.RECORDING]: {
    [TasvirchiPlaybackContext.Type.PLAYBACK]: () => ({type: MediaEntry.Type.VOD})
  }
};

export default class OTTProviderParser {
  private static _logger = getLogger('OTTProviderParser');

  /**
   * Returns parsed media entry by given OTT response objects.
   * @function getMediaEntry
   * @param {any} assetResponse - The asset response.
   * @param {Object} requestData - The request data object.
   * @returns {MediaEntry} - The media entry
   * @static
   * @public
   */
  public static getMediaEntry(assetResponse: any, requestData: any): MediaEntry {
    const mediaEntry = new MediaEntry();
    OTTProviderParser._fillBaseData(mediaEntry, assetResponse, requestData);
    const playbackContext = assetResponse.playBackContextResult;
    const mediaAsset = assetResponse.mediaDataResult;
    const tasvirchiSources = playbackContext.sources;
    const filteredTasvirchiSources = OTTProviderParser._filterSourcesByFormats(tasvirchiSources, requestData.formats);
    mediaEntry.sources = OTTProviderParser._getParsedSources(filteredTasvirchiSources);
    const typeData = OTTProviderParser._getMediaType(mediaAsset.data, requestData.mediaType, requestData.contextType);
    mediaEntry.type = typeData.type;
    mediaEntry.dvrStatus = typeData.dvrStatus;
    // eslint-disable-next-line prefer-spread
    mediaEntry.duration = Math.max.apply(
      Math,
      tasvirchiSources.map(source => source.duration)
    );
    return mediaEntry;
  }

  /**
   * Returns parsed entry list by given OTT response objects
   * @function getEntryList
   * @param {any} playlistResponse - response
   * @param {Array<ProviderMediaInfoObject>} requestEntries - entries list
   * @returns {Playlist} - The entry list
   * @static
   * @public
   */
  public static getEntryList(playlistResponse: any, requestEntries: Array<ProviderMediaInfoObject>): EntryList {
    const entryList = new EntryList();
    const playlistItems = playlistResponse.playlistItems.entries;
    playlistItems.forEach(entry => {
      const mediaEntry = new MediaEntry();
      const requestData = requestEntries.find(requestEntry => requestEntry.entryId === entry.mediaDataResult.id);
      OTTProviderParser._fillBaseData(mediaEntry, entry, requestData);
      entryList.items.push(mediaEntry);
    });
    return entryList;
  }

  /**
   * Returns parsed bumper by given OTT response objects.
   * @function getBumper
   * @param {any} assetResponse - The asset response.
   * @returns {?Bumper} - The bumper
   * @static
   * @public
   */
  public static getBumper(assetResponse: any): Bumper | unknown {
    const playbackContext = assetResponse.playBackContextResult;
    const progressiveBumper = playbackContext.plugins.find(
      bumper => bumper.streamertype === TasvirchiBumpersPlaybackPluginData.StreamerType.PROGRESSIVE
    );
    if (progressiveBumper) {
      return new Bumper(progressiveBumper);
    }
  }

  private static _fillBaseData(mediaEntry: MediaEntry, assetResponse: any, requestData: any): MediaEntry {
    const mediaAsset = assetResponse.mediaDataResult;
    const metaData = OTTProviderParser.reconstructMetadata(mediaAsset);
    metaData.description = mediaAsset.description;
    metaData.name = mediaAsset.name;
    if (mediaAsset.createDate) metaData.createdAt = mediaAsset.createDate;
    if (mediaAsset.endDate) metaData.endDate = mediaAsset.endDate;
    if (mediaAsset.data.entryId) metaData.entryId = mediaAsset.data.entryId;
    if (mediaAsset.data.epgId) metaData.epgId = mediaAsset.data.epgId;
    if (mediaAsset.data.recordingId) metaData.recordingId = mediaAsset.data.recordingId;
    if (requestData && requestData.mediaType) metaData.mediaType = requestData.mediaType;
    if (requestData && requestData.contextType) metaData.contextType = requestData.contextType;
    mediaEntry.metadata = metaData;
    mediaEntry.poster = OTTProviderParser._getPoster(mediaAsset.pictures);
    mediaEntry.id = mediaAsset.id;
    return mediaEntry;
  }

  /**
   * reconstruct the metadata
   * @param {Object} mediaAsset the mediaAsset that contains the response with the metadata.
   * @returns {Object} reconstructed metadata object
   */
  public static reconstructMetadata(mediaAsset: any): any {
    const metadata = {
      metas: OTTProviderParser.addToMetaObject(mediaAsset.metas),
      tags: OTTProviderParser.addToMetaObject(mediaAsset.tags)
    };
    return metadata;
  }

  /**
   * transform an array of [{key: value},{key: value}...] to an object
   * @param {Array<Object>} list a list of objects
   * @returns {Object} an mapped object of the arrayed list.
   */
  public static addToMetaObject(list: Array<any>): any {
    const categoryObj = {};
    if (list) {
      list.forEach(item => {
        categoryObj[item.key] = item.value;
      });
    }
    return categoryObj;
  }

  /**
   * Gets the poster url without width and height.
   * @param {Array<Object>} pictures - Media pictures.
   * @returns {string | Array<Object>} - Poster base url or array of poster candidates.
   * @private
   */
  public static _getPoster(pictures: Poster[]): string | Poster[] {
    if (pictures && pictures.length > 0) {
      const picObj = pictures[0];
      const url = picObj.url;
      // Search for thumbnail service
      const regex = /.*\/thumbnail\/.*(?:width|height)\/\d+\/(?:height|width)\/\d+/;
      if (regex.test(url)) {
        return url;
      }
      return pictures.map(pic => ({url: pic.url, width: pic.width, height: pic.height}));
    }
    return '';
  }

  /**
   * Gets the media type (LIVE/VOD)
   * @param {Object} mediaAssetData - The media asset data.
   * @param {string} mediaType - The asset media type.
   * @param {string} contextType - The asset context type.
   * @returns {Object} - The type data object.
   * @private
   */
  public static _getMediaType(mediaAssetData: any, mediaType: string, contextType: string): any {
    let typeData = {type: MediaEntry.Type.UNKNOWN};
    if (MediaTypeCombinations[mediaType] && MediaTypeCombinations[mediaType][contextType]) {
      typeData = MediaTypeCombinations[mediaType][contextType](mediaAssetData);
    }
    return typeData;
  }

  /**
   * Filtered the tasvirchiSources array by device type.
   * @param {Array<TasvirchiPlaybackSource>} tasvirchiSources - The tasvirchi sources.
   * @param {Array<string>} formats - Partner device formats.
   * @returns {Array<TasvirchiPlaybackSource>} - Filtered tasvirchiSources array.
   * @private
   */
  public static _filterSourcesByFormats(tasvirchiSources: Array<TasvirchiPlaybackSource>, formats: Array<string>): Array<TasvirchiPlaybackSource> {
    if (formats.length > 0) {
      tasvirchiSources = tasvirchiSources.filter(source => formats.includes(source.type));
    }
    return tasvirchiSources;
  }

  /**
   * Returns the parsed sources
   * @function _getParsedSources
   * @param {Array<TasvirchiPlaybackSource>} tasvirchiSources - The tasvirchi sources
   * @param {Object} playbackContext - The playback context
   * @return {MediaSources} - A media sources
   * @static
   * @private
   */
  public static _getParsedSources(tasvirchiSources: Array<TasvirchiPlaybackSource>): MediaSources {
    const sources = new MediaSources();
    const addAdaptiveSource = (source: TasvirchiPlaybackSource): void => {
      const parsedSource = OTTProviderParser._parseAdaptiveSource(source);
      if (parsedSource) {
        const sourceFormat = SupportedStreamFormat.get(source.format);
        sources.map(parsedSource, sourceFormat);
      }
    };
    const parseAdaptiveSources = (): void => {
      tasvirchiSources.filter(source => !isProgressiveSource(source.format)).forEach(addAdaptiveSource);
    };
    const parseProgressiveSources = (): void => {
      tasvirchiSources.filter(source => isProgressiveSource(source.format)).forEach(addAdaptiveSource);
    };
    if (tasvirchiSources && tasvirchiSources.length > 0) {
      parseAdaptiveSources();
      parseProgressiveSources();
    }
    return sources;
  }

  /**
   * Returns a parsed adaptive source
   * @function _parseAdaptiveSource
   * @param {TasvirchiPlaybackSource} tasvirchiSource - A tasvirchi source
   * @returns {?MediaSource} - The parsed adaptive tasvirchiSource
   * @static
   * @private
   */
  public static _parseAdaptiveSource(tasvirchiSource?: TasvirchiPlaybackSource): MediaSource | null {
    const mediaSource = new MediaSource();
    if (tasvirchiSource) {
      const playUrl = tasvirchiSource.url;
      const mediaFormat = SupportedStreamFormat.get(tasvirchiSource.format);
      if (mediaFormat) {
        mediaSource.mimetype = mediaFormat.mimeType;
      }
      if (!playUrl) {
        OTTProviderParser._logger.error(
          `failed to create play url from source, discarding source: (${tasvirchiSource.fileId}), ${tasvirchiSource.format}.`
        );
        return null;
      }
      mediaSource.url = playUrl;
      mediaSource.id = tasvirchiSource.fileId + ',' + tasvirchiSource.format;
      if (tasvirchiSource.hasDrmData()) {
        const drmParams: Array<Drm> = [];
        tasvirchiSource.drm.forEach(drm => {
          drmParams.push(new Drm(drm.licenseURL, TasvirchiDrmPlaybackPluginData.Scheme[drm.scheme], drm.certificate));
        });
        mediaSource.drmData = drmParams;
      }
    }
    return mediaSource;
  }

  public static hasBlockAction(response: OTTAssetLoaderResponse): boolean {
    return response.playBackContextResult.hasBlockAction();
  }

  public static getBlockAction(response: OTTAssetLoaderResponse): TasvirchiRuleAction | undefined {
    return response.playBackContextResult.getBlockAction();
  }

  public static getErrorMessages(response: OTTAssetLoaderResponse): Array<TasvirchiAccessControlMessage> {
    return response.playBackContextResult.getErrorMessages();
  }
}
