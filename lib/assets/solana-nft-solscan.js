'use strict';
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, '__esModule', { value: true });
const base_1 = __importDefault(require('./base'));
const axios_1 = __importDefault(require('axios'));
class SolanaNFTSolscan extends base_1.default {
    constructor(main) {
        super(main);
    }
    async get(options) {
        const list = (
            await axios_1.default.get(`https://public-api.solscan.io/account/tokens`, {
                params: {
                    account: options.identity,
                },
            })
        ).data;
        const assets = (
            await Promise.all(
                list.map(async (item) => {
                    let data = {};
                    try {
                        data = (await axios_1.default.get(`https://public-api.solscan.io/account/${item.tokenAddress}`))
                            .data;
                    } catch (error) {}
                    if (data.tokenInfo.type !== 'nft') {
                        return false;
                    }
                    const asset = {
                        tags: ['NFT'],
                        owners: [options.identity],
                        name: data.metadata?.data.name || data.onchainMetadata?.data.name,
                        description: data.metadata?.data.description,
                        source: 'Solana NFT',
                        metadata: {
                            network: 'Solana',
                            proof: item.tokenAddress,
                            token_standard: 'Metaplex',
                            token_id: item.tokenAddress,
                            token_symbol: data.onchainMetadata?.data.symbol,
                            collection_name: data.metadata?.data.collection.name,
                            providers: ['Solscan'],
                        },
                    };
                    if (data.metadata?.data.image) {
                        asset.previews = [
                            {
                                address: data.metadata?.data.image,
                            },
                        ];
                    }
                    const infoItem = data.metadata?.data.animation_url || data.metadata?.data.image;
                    if (infoItem) {
                        asset.items = [
                            {
                                address: infoItem,
                            },
                        ];
                    }
                    if (data.metadata?.data.attributes) {
                        const attributes = this.generateAttributes(data.metadata?.data.attributes);
                        if (attributes) {
                            asset.attributes = attributes;
                        }
                    }
                    if (data.metadata?.data.external_url) {
                        if (!asset.related_urls) {
                            asset.related_urls = [];
                        }
                        asset.related_urls.push(data.metadata?.data.external_url);
                    }
                    return asset;
                }),
            )
        ).filter((asset) => asset);
        return {
            total: assets.length,
            list: assets,
        };
    }
}
exports.default = SolanaNFTSolscan;
