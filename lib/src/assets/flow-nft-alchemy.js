'use strict';
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, '__esModule', { value: true });
const base_1 = __importDefault(require('./base'));
const axios_1 = __importDefault(require('axios'));
const ethers_1 = require('ethers');
class FlowNFTAlchemy extends base_1.default {
    constructor(main) {
        super(main);
    }
    async get(options) {
        if (!this.main.options.alchemyFlowAPIKey) {
            return {
                total: 0,
                list: [],
            };
        }
        const res = await axios_1.default.get(
            `https://flow-mainnet.g.alchemy.com/v2/${this.main.options.alchemyFlowAPIKey}/getNFTs/`,
            {
                params: {
                    owner: options.identity,
                    limit: options.limit,
                    offset: options.cursor,
                },
            },
        );
        const assets = res.data?.nfts.map((item) => {
            const tokenId = ethers_1.BigNumber.from(item.id.tokenId).toString();
            const asset = {
                tags: ['NFT'],
                owners: [options.identity],
                name: item.title,
                description: item.description,
                source: 'Flow NFT',
                metadata: {
                    network: 'Flow',
                    proof: `${item.contract.address}-${tokenId}`,
                    token_id: tokenId,
                    collection_address: item.contract.address,
                    collection_name: item.contract.name,
                    providers: ['Alchemy'],
                },
            };
            if (item.media?.length) {
                asset.items = item.media.map((media) => ({
                    address: media.uri,
                }));
            }
            if (item.metadata.metadata) {
                const attributes = this.generateAttributes(item.metadata.metadata);
                if (attributes) {
                    asset.attributes = attributes;
                }
            }
            if (item.externalDomainViewUrl) {
                if (!asset.related_urls) {
                    asset.related_urls = [];
                }
                asset.related_urls.push(item.externalDomainViewUrl);
            }
            return asset;
        });
        return {
            total: res.data.nftCount,
            ...((options.cursor || 0) + assets.length < res.data.nftCount && {
                cursor: (options.cursor || 0) + assets.length,
            }),
            list: assets,
        };
    }
}
exports.default = FlowNFTAlchemy;
