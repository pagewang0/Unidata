import Main from '../index';
import Base from './base';
import { AssetsOptions } from './index';
declare class EthereumNFTOpensea extends Base {
    constructor(main: Main);
    get(options: AssetsOptions): Promise<any>;
}
export default EthereumNFTOpensea;
