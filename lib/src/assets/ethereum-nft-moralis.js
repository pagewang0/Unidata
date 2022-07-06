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
class EthereumNFTMoralis extends base_1.default {
    constructor(main) {
        super(main);
    }
    async get(options) {
        if (!this.main.options.moralisWeb3APIKey) {
            return {
                total: 0,
                list: [],
            };
        }
        const chains = ['eth', 'polygon', 'bsc', 'avalanche', 'fantom'];
        const networkMap = {
            eth: 'Ethereum',
            polygon: 'Polygon',
            bsc: 'Binance Smart Chain',
            avalanche: 'Avalanche',
            fantom: 'Fantom',
        };
        let result = [];
        let resyncIndex = 1;
        const cursor = [];
        let total = 0;
        await Promise.all(
            chains.map(async (chain, index) => {
                let res = {};
                try {
                    res = await axios_1.default.get(`https://deep-index.moralis.io/api/v2/${options.identity}/nft`, {
                        params: {
                            chain,
                            cursor: options.cursor?.[index],
                            limit: options.limit,
                        },
                        headers: {
                            'x-api-key': this.main.options.moralisWeb3APIKey,
                        },
                    });
                } catch (error) {}
                let list = [];
                if (res.data?.result && res.data?.result.length) {
                    list = await Promise.all(
                        res.data?.result.map(async (item) => {
                            let metadata;
                            try {
                                if (item.metadata) {
                                    metadata = JSON.parse(item.metadata);
                                } else if (item.token_uri) {
                                    setTimeout(() => {
                                        axios_1.default.get(
                                            `https://deep-index.moralis.io/api/v2/nft/${item.token_address}/${item.token_id}/metadata/resync`,
                                            {
                                                params: {
                                                    chain,
                                                    flag: 'metadata',
                                                    mode: 'sync',
                                                },
                                                headers: {
                                                    'x-api-key': this.main.options.moralisWeb3APIKey,
                                                },
                                            },
                                        );
                                    }, resyncIndex * 10000);
                                    resyncIndex++;
                                }
                            } catch (error) {}
                            const asset = {
                                tags: ['NFT'],
                                owners: [lib_1.utils.getAddress(item.owner_of || options.identity)],
                                name: metadata?.name,
                                description: metadata?.description,
                                source: 'Ethereum NFT',
                                metadata: {
                                    network: networkMap[chain],
                                    proof: `${item.token_address}-${item.token_id}`,
                                    token_standard: `${item.contract_type.slice(0, 3)}-${item.contract_type.slice(3)}`,
                                    token_id: item.token_id,
                                    token_symbol: item.symbol,
                                    collection_address: item.token_address,
                                    collection_name: item.name,
                                    block_number_minted: item.block_number_minted,
                                    block_number: item.block_number,
                                    providers: ['Moralis'],
                                },
                            };
                            const preview = metadata?.image || metadata?.image_url;
                            if (preview) {
                                asset.previews = [
                                    {
                                        address: preview,
                                    },
                                ];
                            }
                            const infoItem = metadata?.animation_url || metadata?.image || metadata?.image_url;
                            if (infoItem) {
                                asset.items = [
                                    {
                                        address: infoItem,
                                    },
                                ];
                            }
                            if (metadata?.attributes) {
                                const attributes = this.generateAttributes(metadata?.attributes);
                                if (attributes) {
                                    asset.attributes = attributes;
                                }
                            }
                            if (metadata?.external_url || metadata?.external_link) {
                                if (!asset.related_urls) {
                                    asset.related_urls = [];
                                }
                                asset.related_urls.push(metadata?.external_url || metadata?.external_link);
                            }
                            return asset;
                        }),
                    );
                }
                result = result.concat(list);
                if (list.length < res.data?.total) {
                    cursor[index] = res.data?.cursor;
                }
                total += res.data?.total || list.length;
                return chain;
            }),
        );
        result = result.sort(
            (a, b) => parseInt(b.metadata?.block_number || 0) - parseInt(a.metadata?.block_number || 0),
        );
        return {
            total: total,
            ...(cursor.find((id) => id) && { cursor: cursor }),
            list: result,
        };
    }
}
exports.default = EthereumNFTMoralis;
