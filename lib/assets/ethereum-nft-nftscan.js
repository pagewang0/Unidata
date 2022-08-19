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
class EthereumNFTNFTScan extends base_1.default {
    constructor(main) {
        super(main);
    }
    async get(options) {
        if (!this.main.options.nftscanAPIKey) {
            return {
                total: 0,
                list: [],
            };
        }
        let result = [];
        const networkMap = {
            Ethereum: 'https://restapi.nftscan.com/',
            Polygon: 'https://polygonapi.nftscan.com/',
            'Binance Smart Chain': 'https://bnbapi.nftscan.com/',
            Arbitrum: 'https://arbitrumapi.nftscan.com/',
            Moonbeam: 'https://moonbeamapi.nftscan.com/',
            Optimism: 'https://optimismapi.nftscan.com/',
        };
        const cursor = [];
        let total = 0;
        let networkWithErc = [];
        const networks = Object.keys(networkMap);
        for (let i = 0; i < networks.length; i++) {
            networkWithErc = networkWithErc.concat([
                [networks[i], 'erc721'],
                [networks[i], 'erc1155'],
            ]);
        }
        await Promise.all(
            networkWithErc.map(async (nwe, index) => {
                const res = await axios_1.default.get(`${networkMap[nwe[0]]}api/v2/account/own/${options.identity}`, {
                    params: {
                        erc_type: nwe[1],
                        limit: 100,
                        cursor: options.cursor?.[index],
                    },
                    headers: {
                        'X-API-KEY': this.main.options.nftscanAPIKey,
                    },
                });
                const assets = res.data?.data?.content?.map((item) => {
                    let metadata;
                    if (item.metadata_json) {
                        try {
                            metadata = JSON.parse(item.metadata_json);
                        } catch (error) {}
                    }
                    const asset = {
                        date_created: new Date(item.mint_timestamp).toISOString(),
                        tags: ['NFT'],
                        owners: [ethers_1.utils.getAddress(options.identity)],
                        name: item.name || metadata?.name,
                        description: metadata?.description,
                        source: 'Ethereum NFT',
                        metadata: {
                            network: nwe[0],
                            proof: `${item.contract_address}-${item.token_id}`,
                            token_standard: nwe[1] === 'erc721' ? 'ERC-721' : 'ERC-1155',
                            token_id: item.token_id,
                            collection_address: item.contract_address,
                            collection_name: item.contract_name,
                            providers: ['NFTScan'],
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
                });
                result = result.concat(assets);
                total += res.data?.data?.total;
                if (res.data?.data?.total && res.data?.data?.total > assets.length) {
                    cursor[index] = res.data?.data?.next;
                }
                return nwe[0];
            }),
        );
        return {
            total: total,
            ...(cursor.find((id) => id) && { cursor: cursor }),
            list: result,
        };
    }
}
exports.default = EthereumNFTNFTScan;
