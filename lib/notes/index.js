'use strict';
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, '__esModule', { value: true });
const mirror_entry_1 = __importDefault(require('./mirror-entry'));
const ethereum_nft_activity_1 = __importDefault(require('./ethereum-nft-activity'));
const gitcoin_contribution_1 = __importDefault(require('./gitcoin-contribution'));
const crossbell_note_1 = __importDefault(require('./crossbell-note'));
class Notes {
    map;
    constructor(main) {
        this.map = {
            'Mirror Entry': new mirror_entry_1.default(main),
            'Ethereum NFT Activity': new ethereum_nft_activity_1.default(main),
            'Gitcoin Contribution': new gitcoin_contribution_1.default(main),
            'Crossbell Note': new crossbell_note_1.default(main),
        };
    }
    async get(options) {
        options = Object.assign(
            {
                limit: 10,
            },
            options,
        );
        const result = await this.map[options.source].get(options);
        result?.list &&
            (result.list = result.list.map((note) => {
                if (!note.date_published) {
                    note.date_published = note.date_created;
                }
                return note;
            }));
        return result;
    }
    async set(options, input) {
        if (this.map[options.source].set) {
            return this.map[options.source].set(options, input);
        } else {
            return {
                code: 1,
                message: 'Method not implemented',
            };
        }
    }
}
exports.default = Notes;
