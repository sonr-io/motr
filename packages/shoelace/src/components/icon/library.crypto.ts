import { getBasePath } from '../../utilities/base-path.js';
import type { IconLibrary } from './library.js';

const library: IconLibrary = {
  name: 'crypto',
  resolver: name => getBasePath(`assets/crypto/${name}.svg`)
};

export default library;
