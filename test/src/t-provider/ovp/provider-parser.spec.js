import OVPProviderParser from '../../../../src/t-provider/ovp/provider-parser';
import {TasvirchiPlaybackContext} from '../../../../src/t-provider/ovp/response-types/tasvirchi-playback-context';
import {
  tasvirchiDashSource,
  tasvirchiProgressiveSourceNotSecured,
  tasvirchiProgressiveSourceSecured,
  tasvirchiProgressiveMultiProtocol,
  tasvirchiProgressiveSourceFlavorAssets,
  tasvirchiDashSourceFlavorAssets,
  tasvirchiSourceProtocolMismatch,
  tasvirchiSourceProtocolMismatchFlavorAssets
} from './playback-sources-data';
import {youtubeMediaEntryResult, youtubeMediaEntryData, liveMediaEntryData} from './provider-parser-data';

describe('provider parser', function () {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });
  describe('_parseAdaptiveSource', () => {
    it('should return a valid adaptive source for a valid input', () => {
      const context = new TasvirchiPlaybackContext({});
      context.flavorAssets = tasvirchiDashSourceFlavorAssets;
      const adaptiveSource = OVPProviderParser._parseAdaptiveSource(tasvirchiDashSource, context, 'myTS', '4321', 1234, 1234);
      adaptiveSource.should.exist;
      adaptiveSource.id.should.equal('1234_911,mpegdash');
      adaptiveSource.mimetype.should.equal('application/dash+xml');
      adaptiveSource.url.should.be.a('string');
    });
    it('should return null if play url is empty', () => {
      const context = new TasvirchiPlaybackContext({});
      context.flavorAssets = tasvirchiSourceProtocolMismatchFlavorAssets;
      const adaptiveSource = OVPProviderParser._parseAdaptiveSource(tasvirchiSourceProtocolMismatch, context, 'myTS', 4321, 1234, 1234);
      (adaptiveSource === null).should.be.true;
    });
  });
  describe('_parseProgressiveSource', () => {
    it('should return a valid progressive sources when getting separate http/s', () => {
      const context = new TasvirchiPlaybackContext({});
      context.flavorAssets = tasvirchiProgressiveSourceFlavorAssets;
      const progressiveSource = OVPProviderParser._getParsedSources(
        [tasvirchiProgressiveSourceNotSecured, tasvirchiProgressiveSourceSecured],
        'myTS',
        1234,
        1234,
        {
          id: '1_938734'
        },
        context
      );
      progressiveSource.should.exist;
      progressiveSource.progressive[0].id.should.equal('0_5407xm9j19951,url');
    });
    it('should return a valid progressive source for a valid input', () => {
      const context = new TasvirchiPlaybackContext({});
      context.flavorAssets = tasvirchiProgressiveSourceFlavorAssets;
      const progressiveSource = OVPProviderParser._getParsedSources(
        [tasvirchiProgressiveMultiProtocol],
        'myTS',
        1234,
        1234,
        {
          id: '1_938734'
        },
        context
      );
      progressiveSource.should.exist;
      progressiveSource.progressive[0].id.should.equal('0_5407xm9j19961,url');
    });
  });

  describe('getMediaEntry', () => {
    it('should return a valid youtube source for a valid input', () => {
      const mediaEntry = OVPProviderParser.getMediaEntry(...youtubeMediaEntryData);
      const mediaEntryObject = mediaEntry.toJSON();
      Object.keys(mediaEntryObject).forEach(key => mediaEntryObject[key] === undefined && delete mediaEntryObject[key]);
      mediaEntryObject.should.deep.equal(youtubeMediaEntryResult);
    });

    it('should add external captions to the media sources', () => {
      const mediaEntry = OVPProviderParser.getMediaEntry(...youtubeMediaEntryData);
      mediaEntry.sources.should.haveOwnProperty('captions');
      mediaEntry.sources.captions.length.should.equal(1);
    });

    it('should not add external captions to live media', () => {
      const mediaEntry = OVPProviderParser.getMediaEntry(...liveMediaEntryData);
      mediaEntry.sources.should.not.haveOwnProperty('captions');
    });
  });
});
