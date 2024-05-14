import {addTsToUrl} from './provider-parser';
import {CaptionType, PCExternalCaptionObject} from '../../types';

const TasvirchiCaptionType: CaptionType = {
  SRT: '1',
  DFXP: '2',
  WEBVTT: '3',
  CAP: '4'
};

const CaptionsFormatsMap: {[format: string]: string} = {
  '3': 'vtt',
  '1': 'srt'
};

class ExternalCaptionsBuilder {
  public static createConfig(captions: Array<any>, ts: string): Array<PCExternalCaptionObject> {
    return captions.map(caption => {
      let url = caption.url;
      let type = CaptionsFormatsMap[caption.format];
      if ([TasvirchiCaptionType.DFXP, TasvirchiCaptionType.CAP].includes(caption.format)) {
        url = caption.webVttUrl;
        type = CaptionsFormatsMap[TasvirchiCaptionType.WEBVTT];
      }
      url = addTsToUrl(url, ts);
      return {
        default: !!caption.isDefault,
        type: type,
        language: caption.languageCode,
        label: caption.label,
        url: url
      };
    });
  }
}

export {ExternalCaptionsBuilder};
