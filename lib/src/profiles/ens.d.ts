import Main from '../index';
import Base from './base';
import { ethers } from 'ethers';
import { ProfilesOptions } from './index';
import { Client } from '@urql/core';
declare class ENS extends Base {
    ethersProvider: ethers.providers.BaseProvider;
    urqlClient: Client;
    constructor(main: Main);
    private init;
    get(options: ProfilesOptions): Promise<{
        list: any[];
        cursor?: any;
        total: number;
    }>;
    set: undefined;
}
export default ENS;
