import {ImageSource} from '../entities/image-source';
import {DocumentSource} from '../entities/document-source';
import {ProviderMediaSourceObject} from './media-source';
import {PCExternalCaptionObject} from './external-caption-object';

export type ProviderMediaSourcesObject = {
  progressive: Array<ProviderMediaSourceObject>;
  dash: Array<ProviderMediaSourceObject>;
  hls: Array<ProviderMediaSourceObject>;
  image: Array<ImageSource>;
  document: Array<DocumentSource>;
  captions?: Array<PCExternalCaptionObject>;
};
