import Main from '../index';
import Base from './base';
import { AssetsOptions } from './index';
import type { Asset } from '../specifications';
declare class EthereumNFTCrossbell extends Base {
    private provider;
    private contracts;
    constructor(main: Main);
    private init;
    get(options: AssetsOptions): Promise<{
        total: any;
        list: Asset[];
    }>;
}
export default EthereumNFTCrossbell;
