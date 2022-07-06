import Main from '../index';
import Base from './base';
import type { Note } from '../specifications';
export declare type NotesOptions = {
    source: string;
    identity?: string;
    platform?: string;
    limit?: number;
    cursor?: any;
    filter?: any;
};
export declare type NoteSetOptions = {
    source: string;
    identity: string;
    platform?: string;
    action?: string;
};
export declare type NoteInput = Partial<Omit<Note, 'date_created' | 'date_updated' | 'source' | 'metadata'>>;
declare class Notes {
    map: {
        [key: string]: Base;
    };
    constructor(main: Main);
    get(options: NotesOptions): Promise<import('../specifications').Notes | null>;
    set(
        options: NoteSetOptions,
        input: NoteInput,
    ): Promise<{
        code: number;
        message: string;
        data?: any;
    }>;
}
export default Notes;
