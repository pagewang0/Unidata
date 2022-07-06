'use strict';
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, '__esModule', { value: true });
const lodash_1 = require('lodash');
const ethereum_nft_moralis_1 = __importDefault(require('./ethereum-nft-moralis'));
const ethereum_nft_opensea_1 = __importDefault(require('./ethereum-nft-opensea'));
const ethereum_nft_poap_1 = __importDefault(require('./ethereum-nft-poap'));
const solana_nft_solscan_1 = __importDefault(require('./solana-nft-solscan'));
const solana_nft_moralis_1 = __importDefault(require('./solana-nft-moralis'));
const ethereum_nft_alchemy_1 = __importDefault(require('./ethereum-nft-alchemy'));
const flow_nft_alchemy_1 = __importDefault(require('./flow-nft-alchemy'));
const gitcoin_contribution_1 = __importDefault(require('./gitcoin-contribution'));
const ethereum_nft_crossbell_1 = __importDefault(require('./ethereum-nft-crossbell'));
const ethereum_nft_nftscan_1 = __importDefault(require('./ethereum-nft-nftscan'));
class Assets {
    main;
    map;
    constructor(main) {
        this.main = main;
        this.map = {
            'Ethereum NFT': {
                NFTScan: new ethereum_nft_nftscan_1.default(main),
                Alchemy: new ethereum_nft_alchemy_1.default(main),
                Moralis: new ethereum_nft_moralis_1.default(main),
                OpenSea: new ethereum_nft_opensea_1.default(main),
                POAP: new ethereum_nft_poap_1.default(main),
                Crossbell: new ethereum_nft_crossbell_1.default(main),
            },
            'Solana NFT': {
                Solscan: new solana_nft_solscan_1.default(main),
                Moralis: new solana_nft_moralis_1.default(main),
            },
            'Flow NFT': {
                Alchemy: new flow_nft_alchemy_1.default(main),
            },
            'Gitcoin Contribution': {
                RSS3: new gitcoin_contribution_1.default(main),
            },
        };
    }
    generateRelatedUrls(asset) {
        if (!asset.related_urls) {
            asset.related_urls = [];
        }
        switch (asset.metadata?.network) {
            case 'Ethereum':
                if (asset.metadata.token_id && asset.metadata.collection_address) {
                    asset.related_urls = asset.related_urls.concat([
                        `https://etherscan.io/nft/${asset.metadata.collection_address}/${asset.metadata.token_id}`,
                        `https://opensea.io/assets/${asset.metadata.collection_address}/${asset.metadata.token_id}`,
                    ]);
                }
                break;
            case 'Polygon':
                if (asset.metadata.token_id && asset.metadata.collection_address) {
                    asset.related_urls = asset.related_urls.concat([
                        `https://polygonscan.com/token/${asset.metadata.collection_address}?a=${asset.metadata.token_id}`,
                        `https://opensea.io/assets/matic/${asset.metadata.collection_address}/${asset.metadata.token_id}`,
                    ]);
                }
                break;
            case 'Binance Smart Chain':
                if (asset.metadata.token_id && asset.metadata.collection_address) {
                    asset.related_urls = asset.related_urls.concat([
                        `https://bscscan.com/token/${asset.metadata.collection_address}?a=${asset.metadata.token_id}`,
                    ]);
                }
                break;
            case 'Gnosis':
                if (asset.metadata.token_id && asset.metadata.collection_address) {
                    asset.related_urls = asset.related_urls.concat([
                        `https://blockscout.com/xdai/mainnet/token/0x22c1f6050e56d2876009903609a2cc3fef83b415/instance/${asset.metadata.token_id}/token-transfers`,
                        `https://app.poap.xyz/token/${asset.metadata.token_id}`,
                    ]);
                }
                break;
            case 'Solana':
                if (asset.metadata.token_id) {
                    asset.related_urls = asset.related_urls.concat([
                        `https://solscan.io/token/${asset.metadata.token_id}`,
                    ]);
                }
                break;
            case 'Crossbell':
                if (asset.metadata.token_id) {
                    asset.related_urls = asset.related_urls.concat([
                        `https://scan.crossbell.io/token/${asset.metadata.collection_address}/instance/${asset.metadata.token_id}`,
                    ]);
                }
                break;
        }
    }
    async get(options) {
        options = Object.assign(
            {
                providers: Object.keys(this.map[options.source]),
            },
            options,
        );
        let result;
        if (options.providers.length > 1) {
            const list = await Promise.all(
                options.providers.map(async (provider, index) => {
                    try {
                        const result = await this.map[options.source][provider].get(
                            Object.assign(options, {
                                cursor: options.cursor?.[index],
                            }),
                        );
                        this.main.utils.removeEmpty(result.list);
                        return result;
                    } catch (error) {
                        return {
                            total: 0,
                            list: [],
                        };
                    }
                }),
            );
            let merged = (0, lodash_1.keyBy)(list[0].list, (item) => item.metadata?.proof);
            for (let i = 1; i < list.length; i++) {
                merged = (0, lodash_1.mergeWith)(
                    merged,
                    (0, lodash_1.keyBy)(list[i].list, (item) => item.metadata?.proof),
                    (a, b) => {
                        if (Array.isArray(a)) {
                            return (0, lodash_1.uniqWith)(b.concat(a), lodash_1.isEqual);
                        }
                    },
                );
            }
            const assets = (0, lodash_1.values)(merged);
            const cursor = list.map((item) => item.cursor);
            result = {
                total: assets.length,
                ...(cursor.find((id) => id) && { cursor: cursor }),
                list: assets,
            };
        } else {
            result = await this.map[options.source][options.providers[0]].get(options);
        }
        const networks = ['Gnosis', 'Binance Smart Chain', 'Polygon', 'Crossbell', 'Ethereum'];
        result.list = result.list
            // default values
            .map((asset) => {
                if (!asset.name) {
                    asset.name = `${asset.metadata?.collection_name || asset.metadata?.token_symbol || ''} #${
                        asset.metadata?.token_id || ''
                    }`;
                }
                if (!asset.description) {
                    asset.description = asset.name;
                }
                if (asset.previews) {
                    asset.previews.forEach((item) => {
                        if (item.address) {
                            item.address = this.main.utils.replaceIPFS(item.address);
                        }
                        if (item.address && !item.mime_type) {
                            item.mime_type = this.main.utils.getMimeType(item.address);
                        }
                    });
                }
                if (asset.items) {
                    asset.items.forEach((item) => {
                        if (item.address) {
                            item.address = this.main.utils.replaceIPFS(item.address);
                        }
                        if (item.address && !item.mime_type) {
                            item.mime_type = this.main.utils.getMimeType(item.address);
                        }
                    });
                }
                if (asset.items && !asset.previews) {
                    asset.previews = asset.items;
                }
                if (asset.previews && !asset.items) {
                    asset.items = asset.previews;
                }
                this.generateRelatedUrls(asset);
                return asset;
            })
            // sort according to network and block_number
            .sort((a, b) => {
                const networkSort =
                    networks.indexOf(b.metadata?.network || '') - networks.indexOf(a.metadata?.network || '');
                if (networkSort) {
                    return networkSort;
                } else if (a.metadata?.block_number && b.metadata?.block_number) {
                    return parseInt(b.metadata?.block_number || 0) - parseInt(a.metadata?.block_number || 0);
                } else if (a.date_created && b.date_created) {
                    return +new Date(b.date_created) - +new Date(a.date_created);
                } else {
                    return 0;
                }
            });
        return result;
    }
}
exports.default = Assets;
