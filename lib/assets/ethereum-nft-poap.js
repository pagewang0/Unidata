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
class EthereumNFTPOAP extends base_1.default {
    constructor(main) {
        super(main);
    }
    async get(options) {
        const res = await axios_1.default.get(`https://api.poap.tech/actions/scan/${options.identity}`);
        const assets = res.data?.map((item) => {
            const asset = {
                tags: ['NFT', 'POAP'],
                owners: [ethers_1.utils.getAddress(item.owner)],
                name: item.event.name,
                description: item.event.description,
                items: [
                    {
                        address: item.event.image_url,
                        mime_type: 'image/png',
                    },
                ],
                attributes: [
                    {
                        key: 'country',
                        value: item.event.country,
                    },
                    {
                        key: 'city',
                        value: item.event.city,
                    },
                    {
                        key: 'year',
                        value: item.event.year,
                    },
                    {
                        key: 'start_date',
                        value: item.event.start_date,
                    },
                    {
                        key: 'end_date',
                        value: item.event.end_date,
                    },
                    {
                        key: 'expiry_date',
                        value: item.event.expiry_date,
                    },
                    {
                        key: 'supply',
                        value: item.event.supply,
                    },
                    {
                        key: 'event_url',
                        value: item.event.event_url,
                    },
                ],
                source: 'Ethereum NFT',
                metadata: {
                    network: 'Gnosis',
                    proof: `0x22C1f6050E56d2876009903609a2cC3fEf83B415-${item.tokenId}`,
                    token_standard: 'ERC-721',
                    token_id: item.tokenId,
                    token_symbol: 'The Proof of Attendance Protocol',
                    collection_address: '0x22C1f6050E56d2876009903609a2cC3fEf83B415',
                    collection_name: 'POAP',
                    providers: ['POAP'],
                },
            };
            return asset;
        });
        return {
            total: assets.length,
            list: assets,
        };
    }
}
exports.default = EthereumNFTPOAP;
