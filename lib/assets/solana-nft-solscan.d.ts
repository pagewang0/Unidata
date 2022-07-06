import Main from '../index';
import Base from './base';
import { AssetsOptions } from './index';
import type { Asset } from '../specifications';
declare class SolanaNFTSolscan extends Base {
    constructor(main: Main);
    get(options: AssetsOptions): Promise<{
        total: number;
        list: Asset[];
    }>;
}
export default SolanaNFTSolscan;
