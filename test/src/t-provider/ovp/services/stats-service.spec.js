import OVPStatsService from '../../../../../src/t-provider/ovp/services/stats/stats-service';
import RequestBuilder from '../../../../../src/util/request-builder';
import OVPConfiguration from '../../../../../src/t-provider/ovp/config';
import {param} from '../../../../../src/util/param';

describe('stats service - collect', function () {
  let ovpParams, ts, event;
  const playerVersion = '1.2.3';

  beforeEach(function () {
    ovpParams = OVPConfiguration.get();
    ts = '1234';
    event = {a: 1};
  });

  it('should be proper values', function () {
    const serviceUrl = 'http://my/url';
    const request = OVPStatsService.collect(serviceUrl, ts, playerVersion, event);
    (request instanceof RequestBuilder).should.be.true;
    request.service.should.be.equal('stats');
    request.action.should.be.equal('collect');
    request.method.should.be.equal('GET');
    request.url.should.be.equal(serviceUrl + '?service=' + request.service + '&action=' + request.action + '&' + param(request.params));
    request.tag.should.be.equal('stats-collect');
    request.params.should.deep.equal(
      Object.assign(
        {},
        ovpParams.serviceParams,
        {
          ts: ts,
          clientTag: 'html5:v' + playerVersion
        },
        event
      )
    );
  });
});
