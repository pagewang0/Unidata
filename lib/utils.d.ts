import Main from './index';
import { Indexer } from 'crossbell.js';
declare class Utils {
    main: Main;
    indexer: Indexer;
    constructor(main: Main);
    replaceIPFS(url: string): string;
    replaceIPFSs(urls: string[]): string[];
    getCrossbellCharacter(options: {
        identity: string;
        platform: string;
    }): Promise<import('crossbell.js').CharacterEntity | null>;
    removeEmpty(
        obj: any,
        father?: {
            obj: any;
            key: string;
        },
    ): void;
    getMimeType(address: string): string | undefined;
    uploadToIPFS(obj: any, filename?: string): Promise<string>;
}
export default Utils;
