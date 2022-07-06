import Main from '../index';
import Base from './base';
import { NotesOptions } from './index';
import type { Notes } from '../specifications';
declare class EthereumNFTActivity extends Base {
    constructor(main: Main);
    get(options: NotesOptions): Promise<Notes>;
    set: undefined;
}
export default EthereumNFTActivity;
