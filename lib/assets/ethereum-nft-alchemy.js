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
class EthereumNFTAlchemy extends base_1.default {
    constructor(main) {
        super(main);
    }
    async get(options) {
        let result = [];
        const networkMap = {
            Ethereum: {
                endpoint: 'https://eth-mainnet.alchemyapi.io/v2/',
                keyName: 'alchemyEthereumAPIKey',
            },
            Polygon: {
                endpoint: 'https://polygon-mainnet.g.alchemy.com/v2/',
                keyName: 'alchemyPolygonAPIKey',
            },
        };
        const cursor = [];
        let total = 0;
        await Promise.all(
            Object.keys(networkMap).map(async (network, index) => {
                const key = this.main.options[networkMap[network].keyName];
                if (!key) {
                    return;
                }
                const res = await axios_1.default.get(`${networkMap[network].endpoint}${key}/getNFTs/`, {
                    params: {
                        owner: options.identity,
                        pageKey: options.cursor?.[index],
                    },
                });
                const assets = res.data?.ownedNfts.map((item) => {
                    const tokenId = ethers_1.BigNumber.from(item.id.tokenId).toString();
                    const asset = {
                        tags: ['NFT'],
                        owners: [ethers_1.utils.getAddress(options.identity)],
                        name: item.title,
                        description: item.description,
                        source: 'Ethereum NFT',
                        metadata: {
                            network: network,
                            proof: `${item.contract.address}-${tokenId}`,
                            token_standard: `${item.id.tokenMetadata.tokenType.slice(
                                0,
                                3,
                            )}-${item.id.tokenMetadata.tokenType.slice(3)}`,
                            token_id: tokenId,
                            collection_address: item.contract.address,
                            providers: ['Alchemy'],
                        },
                    };
                    const preview = item.metadata?.image || item.metadata?.image_url;
                    if (preview) {
                        asset.previews = [
                            {
                                address: preview,
                            },
                        ];
                    }
                    const infoItem = item.metadata?.animation_url || item.metadata?.image || item.metadata?.image_url;
                    if (infoItem) {
                        asset.items = [
                            {
                                address: infoItem,
                            },
                        ];
                    }
                    if (item.metadata?.attributes) {
                        const attributes = this.generateAttributes(item.metadata?.attributes);
                        if (attributes) {
                            asset.attributes = attributes;
                        }
                    }
                    if (item.metadata?.external_url || item.metadata?.external_link) {
                        if (!asset.related_urls) {
                            asset.related_urls = [];
                        }
                        asset.related_urls.push(item.metadata?.external_url || item.metadata?.external_link);
                    }
                    return asset;
                });
                result = result.concat(assets);
                if (assets.length < res.data?.totalCount) {
                    cursor[index] = res.data?.pageKey;
                }
                total += res.data?.totalCount || assets.length;
                return network;
            }),
        );
        return {
            total: total,
            ...(cursor.find((id) => id) && { cursor: cursor }),
            list: result,
        };
    }
}
exports.default = EthereumNFTAlchemy;
