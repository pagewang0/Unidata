import Main from '../index';
import Base from './base';
import { AssetsOptions } from './index';
import type { Asset } from '../specifications';
declare class FlowNFTAlchemy extends Base {
    constructor(main: Main);
    get(options: AssetsOptions): Promise<{
        list: Asset[];
        cursor?: any;
        total: any;
    }>;
}
export default FlowNFTAlchemy;
