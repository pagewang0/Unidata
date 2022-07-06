'use strict';
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, '__esModule', { value: true });
const base_1 = __importDefault(require('./base'));
const axios_1 = __importDefault(require('axios'));
const lib_1 = require('ethers/lib');
const lodash_1 = require('lodash');
class GitcoinContribution extends base_1.default {
    constructor(main) {
        super(main);
    }
    async get(options) {
        const response = (
            await axios_1.default.get(`https://pregod.rss3.dev/v0.4.0/account:${options.identity}@ethereum/notes`, {
                params: {
                    item_sources: 'Gitcoin Contribution',
                },
            })
        ).data;
        const result = {
            total: response.total,
            list: response.list.map((item) => {
                const asset = {
                    date_created: item.date_created,
                    date_updated: item.date_updated,
                    tags: ['Donation'],
                    owners: [lib_1.utils.getAddress(options.identity)],
                    name: item.title,
                    description: item.attachments.filter((attachment) => attachment.type === 'description')[0].content,
                    source: 'Gitcoin Contribution',
                    related_urls: item.related_urls,
                    metadata: {
                        network: item.metadata.approach === 'Standard' ? 'Ethereum' : item.metadata.approach,
                        proof: item.metadata.destination,
                        amounts: [
                            {
                                value: item.metadata.value_amount,
                                symbol: item.metadata.value_symbol,
                            },
                        ],
                        providers: ['RSS3'],
                    },
                };
                const preview = item.attachments.filter((attachment) => attachment.type === 'logo')[0].address;
                if (preview) {
                    asset.previews = [
                        {
                            address: preview,
                        },
                    ];
                }
                return asset;
            }),
        };
        let list = result.list;
        let merged = (0, lodash_1.keyBy)([list[0]], (item) => item.metadata?.proof);
        for (let i = 1; i < list.length; i++) {
            merged = (0, lodash_1.mergeWith)(
                merged,
                (0, lodash_1.keyBy)([list[i]], (item) => item.metadata?.proof),
                (a, b) => {
                    if (Array.isArray(a)) {
                        return (0, lodash_1.uniqWith)(a.concat(b), lodash_1.isEqual);
                    }
                },
            );
        }
        const assets = (0, lodash_1.values)(merged);
        result.list = assets;
        return result;
    }
}
exports.default = GitcoinContribution;
