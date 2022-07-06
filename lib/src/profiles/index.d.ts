import Main from '../index';
import Base from './base';
import type { Profile } from '../specifications';
export declare type ProfilesOptions = {
    source: string;
    identity: string;
    platform?: string;
    limit?: number;
    cursor?: any;
};
export declare type ProfileSetOptions = {
    source: string;
    identity: string;
    platform?: string;
    action?: string;
};
export declare type ProfileInput = Omit<Profile, 'source' | 'metadata'>;
declare class Profiles {
    main: Main;
    map: {
        [key: string]: Base;
    };
    accountsMap: {
        [key: string]: {
            platform: string;
            url?: string;
        };
    };
    constructor(main: Main);
    get(options: ProfilesOptions): Promise<import('../specifications').Profiles>;
    set(
        options: ProfileSetOptions,
        input: ProfileInput,
    ): Promise<{
        code: number;
        message: string;
    }>;
}
export default Profiles;
