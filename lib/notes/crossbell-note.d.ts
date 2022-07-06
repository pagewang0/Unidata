import Main from '../index';
import Base from './base';
import { NotesOptions, NoteSetOptions, NoteInput } from './index';
import { Indexer, Contract } from 'crossbell.js';
import type { Note } from '../specifications';
declare class CrossbellNote extends Base {
    indexer: Indexer;
    contract: Contract;
    constructor(main: Main);
    get(options: NotesOptions): Promise<{
        list: Note[];
        cursor?: string | undefined;
        total: number;
    }>;
    set(
        options: NoteSetOptions,
        input: NoteInput,
    ): Promise<
        | {
              code: number;
              message: string;
              data?: undefined;
          }
        | {
              code: number;
              message: string;
              data: number;
          }
    >;
}
export default CrossbellNote;
