import Main from '../index';
import { ProfilesOptions, ProfileSetOptions, ProfileInput } from './index';
import type { Profiles } from '../specifications';
declare abstract class Base {
    main: Main;
    inited: boolean;
    constructor(main: Main);
    abstract get(options: ProfilesOptions): Promise<Profiles>;
    abstract set?(
        options: ProfileSetOptions,
        input: ProfileInput,
    ): Promise<{
        code: number;
        message: string;
    }>;
}
export default Base;
