import Main from '../index';
import { NotesOptions, NoteSetOptions, NoteInput } from './index';
import type { Notes } from '../specifications';
declare abstract class Base {
    main: Main;
    inited: boolean;
    accountsMap: {
        [key: string]: {
            platform: string;
            url?: string;
        };
    };
    constructor(main: Main);
    abstract get(options: NotesOptions): Promise<Notes | null>;
    abstract set?(
        options: NoteSetOptions,
        input: NoteInput,
    ): Promise<{
        code: number;
        message: string;
        data?: any;
    }>;
}
export default Base;
