import OVPProvider from '../../../../src/t-provider/ovp/provider';
import * as BE_DATA from './be-data';
import * as MEDIA_CONFIG_DATA from './media-config-data';
import {MultiRequestResult} from '../../../../src/t-provider/common/multi-request-builder';
import MultiRequestBuilder from '../../../../src/t-provider/common/multi-request-builder';
import Error from '../../../../src/util/error/error';
import OVPConfiguration from '../../../../src/t-provider/ovp/config';
import OVPMediaEntryLoader from '../../../../src/t-provider/ovp/loaders/media-entry-loader';
import OVPSessionLoader from '../../../../src/t-provider/ovp/loaders/session-loader';

describe('default configuration', () => {
  const partnerId = 1082342;
  const playerVersion = '1.2.3';

  const defaultConfig = OVPConfiguration.get();

  beforeEach(() => {
    OVPConfiguration.set(defaultConfig);
  });

  afterEach(() => {
    OVPConfiguration.set(defaultConfig);
  });

  it('should use config values if they are set', () => {
    const provider = new OVPProvider(
      {
        partnerId: partnerId,
        env: {
          serviceUrl: '111',
          cdnUrl: '222',
          serviceParams: {
            apiVersion: '333',
            format: 4
          },
          useApiCaptions: false
        }
      },
      playerVersion
    );
    provider.env.serviceUrl.should.equal('111');
    provider.env.cdnUrl.should.equal('222');
    provider.env.serviceParams.apiVersion.should.equal('333');
    provider.env.serviceParams.format.should.equal(4);
    provider.env.useApiCaptions.should.equal(false);
  });

  it('should use default values if config values are not set', () => {
    const provider = new OVPProvider({partnerId: partnerId}, playerVersion);
    provider.env.serviceUrl.should.equal(defaultConfig.serviceUrl);
    provider.env.cdnUrl.should.equal(defaultConfig.cdnUrl);
    provider.env.serviceParams.apiVersion.should.equal(defaultConfig.serviceParams.apiVersion);
    provider.env.serviceParams.format.should.equal(defaultConfig.serviceParams.format);
    provider.env.useApiCaptions.should.equal(defaultConfig.useApiCaptions);
  });
});

describe('OVPProvider.partnerId:1082342', function () {
  let provider, sandbox;
  const partnerId = 1082342;
  const playerVersion = '1.2.3';
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    provider = new OVPProvider({partnerId: partnerId}, playerVersion);
  });

  afterEach(() => {
    sandbox.restore();
    MultiRequestBuilder.prototype.execute.restore();
  });

  it('should return config without plugins and without drm data', done => {
    sinon.stub(MultiRequestBuilder.prototype, 'execute').callsFake(function () {
      return new Promise(resolve => {
        resolve({response: new MultiRequestResult(BE_DATA.AnonymousMocEntryWithoutUIConfNoDrmData.response)});
      });
    });
    provider.getMediaConfig({entryId: '1_rsrdfext'}).then(
      mediaConfig => {
        try {
          mediaConfig.should.deep.equal(MEDIA_CONFIG_DATA.NoPluginsNoDrm);
          done();
        } catch (err) {
          done(err);
        }
      },
      err => {
        done(err);
      }
    );
  });

  it('should apply the request host regex to all source urls', done => {
    sinon.stub(MultiRequestBuilder.prototype, 'execute').callsFake(function () {
      return new Promise(resolve => {
        resolve({response: new MultiRequestResult(BE_DATA.AnonymousMocEntryWithRequestHostRegexAction.response)});
      });
    });
    provider.getMediaConfig({entryId: '1_rsrdfext'}).then(
      mediaConfig => {
        try {
          mediaConfig.should.deep.equal(MEDIA_CONFIG_DATA.RegexAppliedAllSources);
          done();
        } catch (err) {
          done(err);
        }
      },
      err => {
        done(err);
      }
    );
  });

  it('should apply the request host regex only to the playManifest source urls', done => {
    OVPConfiguration.set({replaceHostOnlyManifestUrls: true});
    sinon.stub(MultiRequestBuilder.prototype, 'execute').callsFake(function () {
      return new Promise(resolve => {
        resolve({response: new MultiRequestResult(BE_DATA.AnonymousMocEntryWithRequestHostRegexAction.response)});
      });
    });
    provider.getMediaConfig({entryId: '1_rsrdfext'}).then(
      mediaConfig => {
        try {
          mediaConfig.should.deep.equal(MEDIA_CONFIG_DATA.RegexAppliedPlayManifestSources);
          done();
        } catch (err) {
          done(err);
        }
      },
      err => {
        done(err);
      }
    );
  });

  it('should return config with plugins and without drm data', done => {
    provider = new OVPProvider({partnerId: partnerId, uiConfId: 38621471}, playerVersion);
    sinon.stub(MultiRequestBuilder.prototype, 'execute').callsFake(function () {
      return new Promise(resolve => {
        resolve({response: new MultiRequestResult(BE_DATA.EntryWithUIConfNoDrmData.response)});
      });
    });
    provider.getMediaConfig({entryId: '1_rsrdfext'}).then(
      mediaConfig => {
        try {
          mediaConfig.should.deep.equal(MEDIA_CONFIG_DATA.WithPluginsNoDrm);
          done();
        } catch (err) {
          done(err);
        }
      },
      err => {
        done(err);
      }
    );
  });

  it('should be able to get media config by referenceId', done => {
    provider = new OVPProvider({partnerId: partnerId, uiConfId: 38621471}, playerVersion);
    sinon.stub(MultiRequestBuilder.prototype, 'execute').callsFake(function () {
      try {
        this.requests[1].params.filter.referenceIdEqual.should.equal('1_rsrdfext');
        done();
      } catch (err) {
        done(err);
      }
    });
    provider.getMediaConfig({referenceId: '1_rsrdfext'});
  });

  it('should return config without plugins and without drm data for audio', done => {
    sinon.stub(MultiRequestBuilder.prototype, 'execute').callsFake(function () {
      return new Promise(resolve => {
        resolve({response: new MultiRequestResult(BE_DATA.AudioEntryWithoutPlugins.response)});
      });
    });
    provider.getMediaConfig({entryId: '0_vyzw3ceu'}).then(
      mediaConfig => {
        try {
          mediaConfig.should.deep.equal(MEDIA_CONFIG_DATA.AudioEntryWithoutPlugins);
          done();
        } catch (err) {
          done(err);
        }
      },
      err => {
        done(err);
      }
    );
  });

  // currently. the player cannot handle an image (need to add support). So this test is not valid.
  it.skip('should return config without plugins and without drm data for image', done => {
    sinon.stub(MultiRequestBuilder.prototype, 'execute').callsFake(function () {
      return new Promise(resolve => {
        resolve({response: new MultiRequestResult(BE_DATA.ImageEntryWithoutPlugins.response)});
      });
    });
    provider.getMediaConfig({entryId: '0_vyzw3ceu'}).then(
      mediaConfig => {
        try {
          mediaConfig.should.deep.equal(MEDIA_CONFIG_DATA.ImageEntryWithoutPlugins);
          done();
        } catch (err) {
          done(err);
        }
      },
      err => {
        done(err);
      }
    );
  });

  it('should return block error for server block response', done => {
    sinon.stub(MultiRequestBuilder.prototype, 'execute').callsFake(function () {
      return new Promise(resolve => {
        resolve({response: new MultiRequestResult(BE_DATA.BlockActionEntry.response)});
      });
    });
    provider.getMediaConfig({entryId: 1234}).then(
      mediaConfig => {
        try {
          throw new Error('no error returned where block action error was expected', mediaConfig);
        } catch (e) {
          done(e);
        }
      },
      err => {
        const expected = {
          severity: 2,
          category: 2,
          code: 2001,
          data: {
            action: {
              type: 1
            },
            messages: [
              {
                message: "Un authorized country\nWe're sorry, this content is only available in certain countries.",
                code: 'COUNTRY_RESTRICTED'
              }
            ]
          }
        };
        try {
          err.should.deep.equal(expected);
          done();
        } catch (e) {
          done(e);
        }
      }
    );
  });
});

describe('OVPProvider.partnerId:1068292', function () {
  let provider, sandbox;
  const partnerId = 1068292;
  const ts =
    'NTAwZjViZWZjY2NjNTRkNGEyMjU1MTg4OGE1NmUwNDljZWJkMzk1MXwxMDY4MjkyOzEwNjgyOTI7MTQ5MDE3NjE0NjswOzE0OTAwODk3NDYuMDIyNjswO3ZpZXc6Kix3aWRnZXQ6MTs7';
  const playerVersion = '1.2.3';

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    provider = new OVPProvider({partnerId: partnerId, ts: ts}, playerVersion);
  });

  afterEach(() => {
    sandbox.restore();
    MultiRequestBuilder.prototype.execute.restore();
  });

  it('should return config without plugins with drm data', done => {
    sinon.stub(MultiRequestBuilder.prototype, 'execute').callsFake(function () {
      return new Promise(resolve => {
        resolve({response: new MultiRequestResult(BE_DATA.AnonymousMocEntryWithoutUIConfWithDrmData.response)});
      });
    });
    provider.getMediaConfig({entryId: '1_rwbj3j0a'}).then(
      mediaConfig => {
        try {
          let data = JSON.parse(JSON.stringify(MEDIA_CONFIG_DATA.NoPluginsWithDrm));
          data.session.isAnonymous = false;
          mediaConfig.should.deep.equal(data);
          done();
        } catch (err) {
          done(err);
        }
      },
      err => {
        done(err);
      }
    );
  });

  it('should return reject when try to get config with wrong entryId', done => {
    sinon.stub(MultiRequestBuilder.prototype, 'execute').callsFake(function () {
      return new Promise((resolve, reject) => {
        const response = new MultiRequestResult(BE_DATA.WrongEntryIDWithoutUIConf.response);
        if (response.success) {
          resolve({
            response
          });
        } else {
          reject(response);
        }
      });
    });
    provider.getMediaConfig({entryId: '1_rwbj3j0affff'}).then(
      mediaConfig => {
        should.fail(mediaConfig);
      },
      err => {
        err.results.should.deep.equal(MEDIA_CONFIG_DATA.entryIDError);
        done();
      }
    );
  });

  it('should return config with plugins and with drm data', done => {
    provider = new OVPProvider({partnerId: partnerId, ts: ts, uiConfId: 38601981}, playerVersion);
    sinon.stub(MultiRequestBuilder.prototype, 'execute').callsFake(function () {
      return new Promise(resolve => {
        const response = new MultiRequestResult(BE_DATA.EntryWithUIConfWithDrmData.response);
        resolve({
          response
        });
      });
    });
    provider.getMediaConfig({entryId: '1_rwbj3j0a'}).then(
      mediaConfig => {
        try {
          let data = JSON.parse(JSON.stringify(MEDIA_CONFIG_DATA.WithPluginsWithDrm));
          data.session.isAnonymous = false;
          mediaConfig.should.deep.equal(data);
          done();
        } catch (err) {
          done(err);
        }
      },
      err => {
        done(err);
      }
    );
  });

  it('should return reject when try to get config with wrong uiConf ID', done => {
    provider = new OVPProvider({partnerId: partnerId, ts: ts, uiConfId: 38601981}, playerVersion);
    sinon.stub(MultiRequestBuilder.prototype, 'execute').callsFake(function () {
      return new Promise((resolve, reject) => {
        const response = new MultiRequestResult(BE_DATA.WrongUiConfID.response);
        if (response.success) {
          resolve({
            response
          });
        } else {
          reject(response);
        }
      });
    });
    provider.getMediaConfig({entryId: '1_rwbj3j0a'}).then(
      mediaConfig => {
        should.fail(mediaConfig);
      },
      err => {
        err.results.should.deep.equal(MEDIA_CONFIG_DATA.WrongUiConfID);
        done();
      }
    );
  });
});

describe('OVPProvider.partnerId:0', function () {
  let provider, sandbox;
  const partnerId = 0;
  const ts =
    'djJ8MTY0NTE2MXzvlA0ktfU5h5Q_sBfvomsONiVGDO4zRRaJHvTBmnxd9eGmGQq3yvwzedJ8elff4L85A8hbCNE5rhDZsPMqDBFT_cfr1ytLeTLyEhS_ZjyYzEpZWUxzrsXjvgiSo9np4Y9H1pH6avyV4TpknfDDX20H59wjh3QhpZRn3DLryzgoTQ';
  const playerVersion = '1.2.3';

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    provider = new OVPProvider({partnerId: partnerId, ts: ts}, playerVersion);
  });

  afterEach(() => {
    sandbox.restore();
    MultiRequestBuilder.prototype.execute.restore();
  });

  it('should return entry', done => {
    sinon.stub(MultiRequestBuilder.prototype, 'execute').callsFake(function () {
      return new Promise(resolve => {
        resolve({response: new MultiRequestResult(BE_DATA.Partner0EntryData.response)});
      });
    });
    provider.getMediaConfig({entryId: '0_pi55vv3r'}).then(
      mediaConfig => {
        try {
          let data = JSON.parse(JSON.stringify(MEDIA_CONFIG_DATA.EntryOfPartner0));
          mediaConfig.should.deep.equal(data);
          done();
        } catch (err) {
          done(err);
        }
      },
      err => {
        done(err);
      }
    );
  });
});

describe('getMediaConfig', function () {
  let provider, sandbox;
  const partnerId = 1068292;
  const widgetId = '_123456';
  const ts =
    'NTAwZjViZWZjY2NjNTRkNGEyMjU1MTg4OGE1NmUwNDljZWJkMzk1MXwxMDY4MjkyOzEwNjgyOTI7MTQ5MDE3NjE0NjswOzE0OTAwODk3NDYuMDIyNjswO3ZpZXc6Kix3aWRnZXQ6MTs7';
  const playerVersion = '1.2.3';

  describe('getMediaConfig with ts', function () {
    beforeEach(() => {
      sandbox = sinon.createSandbox();
      sinon.stub(MultiRequestBuilder.prototype, 'execute').callsFake(function () {
        return new Promise(resolve => {
          resolve({response: new MultiRequestResult(BE_DATA.AnonymousMocEntryWithoutUIConfWithDrmData.response)});
        });
      });
    });

    afterEach(() => {
      sandbox.restore();
      MultiRequestBuilder.prototype.execute.restore();
    });

    it('should set anonymous to false when given a TS', done => {
      provider = new OVPProvider({partnerId: partnerId}, playerVersion);
      provider.getMediaConfig({entryId: '1_rwbj3j0a', ts: ts}).then(
        mediaConfig => {
          try {
            mediaConfig.session.isAnonymous.should.be.false;
            done();
          } catch (err) {
            done(err);
          }
        },
        err => {
          done(err);
        }
      );
    });

    it('should use the response TS on request with widgetId', done => {
      provider = new OVPProvider({partnerId, widgetId}, playerVersion);
      provider.getMediaConfig({entryId: '1_rwbj3j0a', ts: ts}).then(
        () => {
          try {
            provider.ts.should.equal(ts);
            done();
          } catch (err) {
            done(err);
          }
        },
        err => {
          done(err);
        }
      );
    });
  });

  describe('getMediaConfig without ts', function () {
    beforeEach(() => {
      sandbox = sinon.createSandbox();
      sinon.stub(MultiRequestBuilder.prototype, 'execute').callsFake(function () {
        return new Promise(resolve => {
          resolve({response: new MultiRequestResult(BE_DATA.AnonymousMocEntryWithoutUIConfNoDrmData.response)});
        });
      });
    });

    afterEach(() => {
      sandbox.restore();
      MultiRequestBuilder.prototype.execute.restore();
    });

    it('should pass widgetId to the session loader', done => {
      provider = new OVPProvider({partnerId, widgetId}, playerVersion);
      provider.getMediaConfig({entryId: '1_rwbj3j0a'}).then(
        () => {
          try {
            provider._dataLoader._loaders.get('session')._widgetId.should.equal('_123456');
            done();
          } catch (err) {
            done(err);
          }
        },
        err => {
          done(err);
        }
      );
    });

    it('should set anonymous to false when given a widgetId', done => {
      provider = new OVPProvider({partnerId, widgetId}, playerVersion);
      provider.getMediaConfig({entryId: '1_rwbj3j0a'}).then(
        () => {
          try {
            provider._isAnonymous.should.be.false;
            done();
          } catch (err) {
            done(err);
          }
        },
        err => {
          done(err);
        }
      );
    });

    it('should pass _partnerId to the session loader', done => {
      provider = new OVPProvider({partnerId}, playerVersion);
      provider.getMediaConfig({entryId: '1_rwbj3j0a'}).then(
        () => {
          try {
            provider._dataLoader._loaders.get('session')._widgetId.should.equal('_1068292');
            done();
          } catch (err) {
            done(err);
          }
        },
        err => {
          done(err);
        }
      );
    });

    it('should use the response TS on request with widgetId', done => {
      provider = new OVPProvider({partnerId, widgetId}, playerVersion);
      provider.getMediaConfig({entryId: '1_rwbj3j0a'}).then(
        () => {
          try {
            provider.ts.should.equal(BE_DATA.AnonymousMocEntryWithoutUIConfNoDrmData.response[0].ts);
            done();
          } catch (err) {
            done(err);
          }
        },
        err => {
          done(err);
        }
      );
    });
  });

  describe('getMediaConfig status check', function () {
    afterEach(() => {
      MultiRequestBuilder.prototype.execute.restore();
    });
    it('should request entryId with status in import', done => {
      sinon.stub(MultiRequestBuilder.prototype, 'execute').callsFake(function () {
        return new Promise(resolve => {
          resolve({response: new MultiRequestResult(BE_DATA.EntryInImport.response)});
        });
      });
      provider = new OVPProvider({partnerId: 2506752}, playerVersion);
      provider.getMediaConfig({entryId: '0_fknc1xml'}).catch(err => {
        try {
          err.severity.should.equal(Error.Severity.CRITICAL);
          err.code.should.equal(Error.Code.MEDIA_STATUS_NOT_READY);
          done();
        } catch (e) {
          done(e);
        }
      });
    });
    it('should request entryId with status in preconvert', done => {
      sinon.stub(MultiRequestBuilder.prototype, 'execute').callsFake(function () {
        return new Promise(resolve => {
          resolve({response: new MultiRequestResult(BE_DATA.EntryInPreConvert.response)});
        });
      });
      provider = new OVPProvider({partnerId: 2506752}, playerVersion);
      provider.getMediaConfig({entryId: '0_fknc1xml'}).catch(err => {
        try {
          err.severity.should.equal(Error.Severity.CRITICAL);
          err.code.should.equal(Error.Code.MEDIA_STATUS_NOT_READY);
          done();
        } catch (e) {
          done(e);
        }
      });
    });
    it('should request entryId with status ready', done => {
      sinon.stub(MultiRequestBuilder.prototype, 'execute').callsFake(function () {
        return new Promise(resolve => {
          resolve({response: new MultiRequestResult(BE_DATA.EntryInReady.response)});
        });
      });
      provider = new OVPProvider({partnerId: 2506752}, playerVersion);
      provider.getMediaConfig({entryId: '0_yp010l8a'}).then(() => {
        done();
      });
    });
  });

  describe('getMediaConfig with bumper', function () {
    let provider, sandbox;
    const partnerId = 1091;
    const ts =
      'YmMzNzUyZWM4ZmVkYjRiMzRlOTBlYTZjMGY2YTI1NzRkZDUwZjZjNnwxMDkxOzEwOTE7MTYwNTcyMjI5NDsyOzE2MDU2MzU4OTQuMTA0MzthdmkuYmFydWNoQGthbHR1cmEuY29tOyosZGlzYWJsZWVudGl0bGVtZW50Ozs';
    const playerVersion = '1.2.3';

    beforeEach(() => {
      sandbox = sinon.createSandbox();
    });

    afterEach(() => {
      sandbox.restore();
      MultiRequestBuilder.prototype.execute.restore();
    });

    it('should set the bumper plugin with no ts', done => {
      sinon.stub(MultiRequestBuilder.prototype, 'execute').callsFake(function () {
        return new Promise(resolve => {
          resolve({response: new MultiRequestResult(BE_DATA.EntryWithBumper.response)});
        });
      });
      provider = new OVPProvider({partnerId: partnerId}, playerVersion);
      provider.getMediaConfig({entryId: '0_wifqaipd'}).then(
        mediaConfig => {
          try {
            mediaConfig.should.deep.equal(MEDIA_CONFIG_DATA.EntryWithBumper);
            done();
          } catch (err) {
            done(err);
          }
        },
        err => {
          done(err);
        }
      );
    });

    it('should set the bumper plugin with ts', done => {
      sinon.stub(MultiRequestBuilder.prototype, 'execute').callsFake(function () {
        return new Promise(resolve => {
          resolve({response: new MultiRequestResult(BE_DATA.EntryWithBumperWithTs.response)});
        });
      });
      provider = new OVPProvider({partnerId: partnerId}, playerVersion);
      provider.getMediaConfig({entryId: '0_wifqaipd', ts}).then(
        mediaConfig => {
          try {
            mediaConfig.should.deep.equal(MEDIA_CONFIG_DATA.EntryWithBumperWithTs);
            done();
          } catch (err) {
            done(err);
          }
        },
        err => {
          done(err);
        }
      );
    });

    it('should not set the bumper plugin when no sources given', done => {
      sinon.stub(MultiRequestBuilder.prototype, 'execute').callsFake(function () {
        return new Promise(resolve => {
          resolve({response: new MultiRequestResult(BE_DATA.EntryWithBumperWitNoSources.response)});
        });
      });
      provider = new OVPProvider({partnerId: partnerId}, playerVersion);
      provider.getMediaConfig({entryId: '0_wifqaipd', ts}).then(
        mediaConfig => {
          try {
            mediaConfig.should.deep.equal(MEDIA_CONFIG_DATA.EntryWithNoBumper);
            done();
          } catch (err) {
            done(err);
          }
        },
        err => {
          done(err);
        }
      );
    });
  });
});

describe('getPlaylistConfig', function () {
  let provider, sandbox;
  const partnerId = 1091;
  const ts = 'MDlkOTIzMzRhZmM4MmJmNTIwYzZkYzZhMzc0ZTRiNWI1NTRiZjNhM3wxMDkxOzEwOTE7MTU0NDc5NzcyMjswOzE1NDQ3MTEzMjIuODk2MTswO3ZpZXc6Kix3aWRnZXQ6MTs7';
  const playerVersion = '1.2.3';

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    provider = new OVPProvider({partnerId}, playerVersion);
  });

  afterEach(() => {
    sandbox.restore();
    MultiRequestBuilder.prototype.execute.restore();
  });

  it('should load a playlist by id - anonymous', done => {
    sinon.stub(MultiRequestBuilder.prototype, 'execute').callsFake(function () {
      return new Promise(resolve => {
        resolve({response: new MultiRequestResult(BE_DATA.AnonymousPlaylistById.response)});
      });
    });
    provider.getPlaylistConfig({playlistId: '0_wckoqjnn'}).then(
      playlistConfig => {
        try {
          playlistConfig.id.should.equal('0_wckoqjnn');
          playlistConfig.items.length.should.equal(8);
          playlistConfig.metadata.name.should.equal('Playlist_VOD_Only');
          playlistConfig.metadata.description.should.equal('Playlist_VOD_Only_desc');
          playlistConfig.poster.should.equal('http://cdntesting.qa.mtasvirchi.com/p/1091/sp/0/thumbnail/entry_id/0_wckoqjnn/version/100162');
          (playlistConfig.playlistLastEntryId === undefined).should.eql(true);
          done();
        } catch (err) {
          done(err);
        }
      },
      err => {
        done(err);
      }
    );
  });

  it('should load a playlist by id - with TS', done => {
    sinon.stub(MultiRequestBuilder.prototype, 'execute').callsFake(function () {
      return new Promise(resolve => {
        resolve({response: new MultiRequestResult(BE_DATA.PlaylistById.response)});
      });
    });
    provider.getPlaylistConfig({playlistId: '0_wckoqjnn', ts}).then(
      playlistConfig => {
        try {
          playlistConfig.id.should.equal('0_wckoqjnn');
          playlistConfig.items.length.should.equal(8);
          playlistConfig.metadata.name.should.equal('Playlist_VOD_Only');
          playlistConfig.metadata.description.should.equal('Playlist_VOD_Only_desc');
          playlistConfig.poster.should.equal('http://cdntesting.qa.mtasvirchi.com/p/1091/sp/0/thumbnail/entry_id/0_wckoqjnn/version/100162');
          playlistConfig.playlistLastEntryId.should.equal('0_15xrxwvo');
          done();
        } catch (err) {
          done(err);
        }
      },
      err => {
        done(err);
      }
    );
  });
});

describe('getEntryListConfig', function () {
  let provider, sandbox;
  const partnerId = 1091;
  const ts = 'MGVjMWI2ZDRkNmUwNTU4ODk5MWQyZmU4NzZlMmU4OGJjYzI5OTFmYnwxMDkxOzEwOTE7MTU0NDc5NDg4NzswOzE1NDQ3MDg0ODcuOTY1OTswO3ZpZXc6Kix3aWRnZXQ6MTs7';
  const playerVersion = '1.2.3';

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    provider = new OVPProvider({partnerId: partnerId}, playerVersion);
  });

  afterEach(() => {
    sandbox.restore();
    MultiRequestBuilder.prototype.execute.restore();
  });

  it('should load a playlist by entry list - anonymous', done => {
    sinon.stub(MultiRequestBuilder.prototype, 'execute').callsFake(function () {
      return new Promise(resolve => {
        resolve({response: new MultiRequestResult(BE_DATA.AnonymousPlaylistByEntryList.response)});
      });
    });
    provider.getEntryListConfig({entries: ['0_nwkp7jtx', {entryId: '0_wifqaipd'}, '0_p8aigvgu']}).then(
      entryListConfig => {
        try {
          entryListConfig.id.should.equal('');
          entryListConfig.items.length.should.equal(3);
          entryListConfig.metadata.name.should.equal('');
          entryListConfig.metadata.description.should.equal('');
          entryListConfig.poster.should.equal('');
          done();
        } catch (err) {
          done(err);
        }
      },
      err => {
        done(err);
      }
    );
  });

  it('should load a playlist by entry list - with TS', done => {
    sinon.stub(MultiRequestBuilder.prototype, 'execute').callsFake(function () {
      return new Promise(resolve => {
        resolve({response: new MultiRequestResult(BE_DATA.PlaylistByEntryList.response)});
      });
    });
    provider.getEntryListConfig({entries: ['0_nwkp7jtx', {entryId: '0_wifqaipd'}, '0_p8aigvgu'], ts}).then(
      entryListConfig => {
        try {
          entryListConfig.id.should.equal('');
          entryListConfig.items.length.should.equal(3);
          entryListConfig.metadata.name.should.equal('');
          entryListConfig.metadata.description.should.equal('');
          entryListConfig.poster.should.equal('');
          done();
        } catch (err) {
          done(err);
        }
      },
      err => {
        done(err);
      }
    );
  });

  it('should load a partial playlist by entry list if some requests have an error', done => {
    sinon.stub(MultiRequestBuilder.prototype, 'execute').callsFake(function () {
      return new Promise(resolve => {
        resolve({response: new MultiRequestResult([...BE_DATA.PlaylistByEntryList.response, BE_DATA.WrongEntryIDWithoutUIConf.response])});
      });
    });

    provider.getEntryListConfig({entries: ['0_nwkp7jtx', {entryId: '0_wifqaipd'}, '0_p8aigvgu'], ts}).then(
      entryListConfig => {
        try {
          entryListConfig.id.should.equal('');
          entryListConfig.items.length.should.equal(3);
          entryListConfig.metadata.name.should.equal('');
          entryListConfig.metadata.description.should.equal('');
          entryListConfig.poster.should.equal('');
          done();
        } catch (err) {
          done(err);
        }
      },
      err => {
        done(err);
      }
    );
  });
});

describe('getPlaybackContext', () => {
  let provider, sandbox;
  const partnerId = 1068292;
  const ts =
    'NTAwZjViZWZjY2NjNTRkNGEyMjU1MTg4OGE1NmUwNDljZWJkMzk1MXwxMDY4MjkyOzEwNjgyOTI7MTQ5MDE3NjE0NjswOzE0OTAwODk3NDYuMDIyNjswO3ZpZXc6Kix3aWRnZXQ6MTs7';
  const playerVersion = '1.2.3';

  afterEach(() => {
    sandbox.restore();
    MultiRequestBuilder.prototype.execute.restore();
  });

  it('should request entryId token {1:result:objects:0:id} in request with valid TS', done => {
    sandbox = sinon.createSandbox();
    sinon.stub(MultiRequestBuilder.prototype, 'execute').callsFake(function () {
      return new Promise(resolve => {
        resolve({response: new MultiRequestResult(BE_DATA.AnonymousMocEntryWithoutUIConfWithDrmData.response)});
      });
    });
    provider = new OVPProvider({partnerId: partnerId}, playerVersion);
    provider
      .getMediaConfig({entryId: '1_rwbj3j0a', ts: ts})
      .then(() => {
        const getPlaybackContext = provider._dataLoader._multiRequest.requests.find(request => {
          return request.action === 'getPlaybackContext';
        });
        getPlaybackContext.params.entryId.should.equal('{1:result:objects:0:id}');
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('should add TS to direct playbackContext', done => {
    sandbox = sinon.createSandbox();
    sinon.stub(MultiRequestBuilder.prototype, 'execute').callsFake(function () {
      return new Promise(resolve => {
        resolve({response: new MultiRequestResult(BE_DATA.EntryDirectWithTs.response)});
      });
    });
    provider = new OVPProvider({partnerId: partnerId}, playerVersion);
    provider.getMediaConfig({entryId: '0_wifqaipd', ts: ts}).then(
      mediaConfig => {
        try {
          const result = mediaConfig.sources.dash.filter(source => {
            const tsParam = source.url.indexOf('?') === -1 ? 'ts/' : source.url.indexOf('?ts') === -1 ? '&ts=' : '?ts=';
            return source.url.indexOf(tsParam + ts) !== -1;
          });
          result.should.deep.equal(mediaConfig.sources.dash);
          done();
        } catch (err) {
          done(err);
        }
      },
      err => {
        done(err);
      }
    );
  });

  it('should add TS to external captions url', done => {
    sandbox = sinon.createSandbox();
    sinon.stub(MultiRequestBuilder.prototype, 'execute').callsFake(function () {
      return new Promise(resolve => {
        resolve({response: new MultiRequestResult(BE_DATA.EntryExternalCaptionWithTS.response)});
      });
    });
    provider = new OVPProvider({partnerId: partnerId}, playerVersion);
    provider.getMediaConfig({entryId: '1_rwbj3j0a', ts: ts}).then(
      mediaConfig => {
        try {
          const result = mediaConfig.sources.captions.filter(caption => {
            const tsParam = caption.url.indexOf('?') === -1 ? 'ts/' : caption.url.indexOf('?ts') === -1 ? '&ts=' : '?ts=';
            return caption.url.indexOf(tsParam + ts) !== -1;
          });
          result.should.deep.equal(mediaConfig.sources.captions);
          done();
        } catch (err) {
          done(err);
        }
      },
      err => {
        done(err);
      }
    );
  });

  it('should request entryId token {2:result:objects:0:id} in request with anonymous TS', done => {
    sinon.stub(MultiRequestBuilder.prototype, 'execute').callsFake(function () {
      return new Promise(resolve => {
        resolve({response: new MultiRequestResult(BE_DATA.AnonymousMocEntryWithoutUIConfNoDrmData.response)});
      });
    });
    provider = new OVPProvider({partnerId: 1082342}, playerVersion);
    provider
      .getMediaConfig({entryId: '1_rsrdfext'})
      .then(() => {
        const getPlaybackContext = provider._dataLoader._multiRequest.requests.find(request => {
          return request.action === 'getPlaybackContext';
        });
        getPlaybackContext.params.entryId.should.equal('{2:result:objects:0:id}');
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('should not add TS to external captions', done => {
    sandbox = sinon.createSandbox();
    sinon.stub(MultiRequestBuilder.prototype, 'execute').callsFake(function () {
      return new Promise(resolve => {
        resolve({response: new MultiRequestResult(BE_DATA.EntryExternalCaptionNoTS.response)});
      });
    });
    provider = new OVPProvider({partnerId: partnerId}, playerVersion);
    provider.getMediaConfig({entryId: '1_rwbj3j0a'}).then(
      mediaConfig => {
        try {
          const result = mediaConfig.sources.captions.filter(caption => {
            const tsParam = caption.url.indexOf('?') === -1 ? 'ts/' : caption.url.indexOf('?ts') === -1 ? '&ts=' : '?ts=';
            return caption.url.indexOf(tsParam + ts) === -1;
          });
          result.should.deep.equal(mediaConfig.sources.captions);
          done();
        } catch (err) {
          done(err);
        }
      },
      err => {
        done(err);
      }
    );
  });
});

describe('doRequest', () => {
  let provider, params, sandbox;
  const partnerId = 1068292;
  const playerVersion = '1.2.3';
  const ts =
    'NDIxYjc3MmJhMmI1YTBhYTc1N2U2ODI0NjA4MWU0YzVhNGI3ZDQzM3wxMDY4MjkyOzEwNjgyOTI7MTYzOTM5NDk2OTsyOzE2MzkzMDg1NjkuOTg1NTtwaGlsbC5wcmljZUBkaXNuZXkuY29tOyosZGlzYWJsZWVudGl0bGVtZW50Ozs';

  beforeEach(() => {
    provider = new OVPProvider({partnerId: partnerId}, playerVersion);
    params = {
      referenceId: '',
      entryId: '1_rwbj3j0a',
      redirectFromEntryId: true,
      ts: ''
    };
  });

  afterEach(() => {
    sandbox.restore();
    MultiRequestBuilder.prototype.execute.restore();
  });

  it('should add session request to the multirequest and use that TS', done => {
    sandbox = sinon.createSandbox();
    sinon.stub(MultiRequestBuilder.prototype, 'execute').callsFake(function () {
      return new Promise(resolve => {
        resolve({response: new MultiRequestResult(BE_DATA.Session.response)});
      });
    });
    provider
      .doRequest([{loader: OVPMediaEntryLoader, params}])
      .then((data) => {
        data.has(OVPSessionLoader.id).should.be.true;
        data.get(OVPSessionLoader.id).response.should.equal(ts);
        provider.isAnonymous.should.be.true;
        const mediaLoader = data.get(OVPMediaEntryLoader.id);
        mediaLoader._requests[1].params.ts.should.equal('{1:result:ts}');
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('should use TS from provider', done => {
    sandbox = sinon.createSandbox();
    sinon.stub(MultiRequestBuilder.prototype, 'execute').callsFake(function () {
      return new Promise(resolve => {
        resolve({response: {}});
      });
    });
    params.ts = ts;
    provider.ts = ts;
    provider
      .doRequest([{loader: OVPMediaEntryLoader, params}])
      .then((data) => {
        data.has(OVPSessionLoader.id).should.be.false;
        const mediaLoader = data.get(OVPMediaEntryLoader.id);
        mediaLoader._requests[0].params.ts.should.equal(provider.ts);
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('should use external TS', done => {
    sandbox = sinon.createSandbox();
    sinon.stub(MultiRequestBuilder.prototype, 'execute').callsFake(function () {
      return new Promise(resolve => {
        resolve({response: {}});
      });
    });
    params.ts = ts;
    provider
      .doRequest([{loader: OVPMediaEntryLoader, params}], ts)
      .then((data) => {
        provider.ts.should.equal('');
        data.has(OVPSessionLoader.id).should.be.false;
        provider.isAnonymous.should.be.true;
        const mediaLoader = data.get(OVPMediaEntryLoader.id);
        mediaLoader._requests[0].params.ts.should.equal(ts);
        done();
      })
      .catch(err => {
        done(err);
      });
  });
});
