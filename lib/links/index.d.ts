import Main from '../index';
import Base from './base';
import type { Link } from '../specifications';
export declare type LinksOptions = {
    source: string;
    identity: string;
    platform?: string;
    type?: string;
    reversed?: boolean;
    cursor?: any;
    limit?: number;
    filter?: any;
};
export declare type LinkSetOptions = {
    source: string;
    identity: string;
    platform?: string;
    action?: string;
};
export declare type LinkInput = Omit<Link, 'date_created' | 'from' | 'source' | 'metadata'>;
declare class Links {
    map: {
        [key: string]: Base;
    };
    constructor(main: Main);
    get(options: LinksOptions): Promise<import('../specifications').Links | null>;
    set(
        options: LinkSetOptions,
        input: LinkInput,
    ): Promise<{
        code: number;
        message: string;
    }>;
}
export default Links;
