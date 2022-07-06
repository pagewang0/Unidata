import Main from '../index';
import Base from './base';
import { AssetsOptions } from './index';
import type { Assets } from '../specifications';
declare class GitcoinContribution extends Base {
    constructor(main: Main);
    get(options: AssetsOptions): Promise<Assets>;
}
export default GitcoinContribution;
