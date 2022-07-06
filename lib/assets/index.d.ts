import Main from '../index';
import Base from './base';
export declare type AssetsOptions = {
    source: string;
    identity: string;
    providers?: string[];
    limit?: number;
    cursor?: any;
};
declare class Assets {
    main: Main;
    map: {
        [key: string]: {
            [key: string]: Base;
        };
    };
    constructor(main: Main);
    private generateRelatedUrls;
    get(options: AssetsOptions): Promise<any>;
}
export default Assets;
