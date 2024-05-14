import OTTProvider from './provider';
import TasvirchiPlaybackContext from './response-types/tasvirchi-playback-context';
import TasvirchiAsset from './response-types/tasvirchi-asset';

declare let __VERSION__: string;
declare let __NAME__: string;

const NAME = __NAME__ + '-ott';
const VERSION = __VERSION__;

const ContextType = TasvirchiPlaybackContext.Type;
const MediaType = TasvirchiAsset.Type;

export {OTTProvider as Provider, ContextType, MediaType, NAME, VERSION};
