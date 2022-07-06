import Main from '../index';
import Base from './base';
import { AssetsOptions } from './index';
import type { Asset } from '../specifications';
declare class EthereumNFTMoralis extends Base {
    constructor(main: Main);
    get(options: AssetsOptions): Promise<{
        list: Asset[];
        cursor?: string[] | undefined;
        total: number;
    }>;
}
export default EthereumNFTMoralis;
