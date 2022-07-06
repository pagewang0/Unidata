import Main from '../index';
import Base from './base';
import { AssetsOptions } from './index';
import type { Asset } from '../specifications';
declare class EthereumNFTAlchemy extends Base {
    constructor(main: Main);
    get(options: AssetsOptions): Promise<{
        list: Asset[];
        cursor?: string[] | undefined;
        total: number;
    }>;
}
export default EthereumNFTAlchemy;
