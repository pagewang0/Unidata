import Main from '../index';
import Base from './base';
import { LinksOptions, LinkSetOptions, LinkInput } from './index';
import { Indexer, Contract } from 'crossbell.js';
declare class CrossbellLink extends Base {
    indexer: Indexer;
    contract: Contract;
    constructor(main: Main);
    get(options: LinksOptions): Promise<{
        list: {
            date_created: string;
            from: string;
            to: string;
            type: string;
            source: string;
            metadata: {
                network: string;
                proof: string;
                block_number: number;
                from_owner: string | undefined;
                to_owner: string | undefined;
            };
        }[];
        cursor?: string | undefined;
        total: number;
    }>;
    set(
        options: LinkSetOptions,
        link: LinkInput,
    ): Promise<{
        code: number;
        message: string;
    }>;
}
export default CrossbellLink;
