'use strict';
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, '__esModule', { value: true });
const base_1 = __importDefault(require('./base'));
const axios_1 = __importDefault(require('axios'));
class SolanaNFTMoralis extends base_1.default {
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
        const list = (
            await axios_1.default.get(`https://solana-gateway.moralis.io/account/mainnet/${options.identity}/nft`, {
                headers: {
                    'x-api-key': this.main.options.moralisWeb3APIKey,
                },
            })
        ).data;
        const assets = await Promise.all(
            list.map(async (item) => {
                let moralisdata = {};
                try {
                    moralisdata = (
                        await axios_1.default.get(
                            `https://solana-gateway.moralis.io/nft/mainnet/${item.mint}/metadata`,
                            {
                                headers: {
                                    'x-api-key': this.main.options.moralisWeb3APIKey,
                                },
                            },
                        )
                    ).data;
                } catch (error) {}
                let metadata = {};
                try {
                    metadata = (await axios_1.default.get(moralisdata.metaplex?.metadataUri)).data;
                } catch (error) {}
                const asset = {
                    tags: ['NFT'],
                    owners: [options.identity],
                    name: metadata.name || moralisdata.name,
                    description: metadata.description,
                    source: 'Solana NFT',
                    metadata: {
                        network: 'Solana',
                        proof: item.mint,
                        token_standard: moralisdata.standard,
                        token_id: item.mint,
                        token_symbol: metadata.symbol || moralisdata.symbol,
                        collection_name: metadata.collection?.name,
                        providers: ['Moralis'],
                    },
                };
                if (metadata.image) {
                    asset.previews = [
                        {
                            address: metadata.image,
                        },
                    ];
                }
                const infoItem = metadata.animation_url || metadata.image;
                if (infoItem) {
                    asset.items = [
                        {
                            address: infoItem,
                        },
                    ];
                }
                if (metadata.attributes) {
                    const attributes = this.generateAttributes(metadata.attributes);
                    if (attributes) {
                        asset.attributes = attributes;
                    }
                }
                if (metadata.external_url) {
                    if (!asset.related_urls) {
                        asset.related_urls = [];
                    }
                    asset.related_urls.push(metadata.external_url);
                }
                return asset;
            }),
        );
        return {
            total: assets.length,
            list: assets,
        };
    }
}
exports.default = SolanaNFTMoralis;
