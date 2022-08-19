import Main from '../index';
import Base from './base';
import { Indexer, Contract } from 'crossbell.js';
import { ProfilesOptions, ProfileSetOptions, ProfileInput } from './index';
import type { Profile } from '../specifications';
declare class CrossbellProfile extends Base {
    indexer: Indexer;
    contract: Contract;
    constructor(main: Main);
    get(options: ProfilesOptions): Promise<{
        list: Profile[];
        cursor?: string | undefined;
        total: number;
    }>;
    set(
        options: ProfileSetOptions,
        input: ProfileInput,
    ): Promise<{
        code: number;
        message: string;
    }>;
}
export default CrossbellProfile;
