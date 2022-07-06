import Main from '../index';
import { AssetsOptions } from './index';
import type { Asset, Assets } from '../specifications';
declare abstract class Base {
    main: Main;
    inited: boolean;
    constructor(main: Main);
    abstract get(options: AssetsOptions): Promise<Assets>;
    generateAttributes(attributes: any): Asset['attributes'] | undefined;
}
export default Base;
