'use strict';
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, '__esModule', { value: true });
const base_1 = __importDefault(require('./base'));
const crossbell_js_1 = require('crossbell.js');
const axios_1 = __importDefault(require('axios'));
const lodash_es_1 = require('lodash');
class CrossbellProfile extends base_1.default {
    indexer;
    contract;
    constructor(main) {
        super(main);
        crossbell_js_1.Network.setIpfsGateway(this.main.options.ipfsGateway);
    }
    async get(options) {
        if (!this.indexer) {
            this.indexer = new crossbell_js_1.Indexer();
        }
        options = Object.assign(
            {
                platform: 'Ethereum',
            },
            options,
        );
        let response;
        if (options.platform === 'Ethereum') {
            response = await this.indexer.getCharacters(options.identity, {
                cursor: options.cursor,
                limit: options.limit,
            });
        } else {
            const character = await this.indexer.getCharacterByHandle(options.identity);
            if (character) {
                response = {
                    count: 1,
                    cursor: '',
                    list: [character],
                };
            } else {
                response = {
                    count: 0,
                    cursor: '',
                    list: [],
                };
            }
        }
        let list = await Promise.all(
            response.list?.map(async (item) => {
                if (item.uri && !(item.metadata && item.metadata.content)) {
                    try {
                        const res = await axios_1.default.get(this.main.utils.replaceIPFS(item.uri));
                        item.metadata = {
                            content: res.data,
                        };
                    } catch (error) {}
                }
                const profile = Object.assign(
                    {
                        date_created: item.createdAt,
                        date_updated: item.updatedAt,
                        username: item.handle,
                        source: 'Crossbell Profile',
                        metadata: {
                            network: 'Crossbell',
                            proof: item.characterId,
                            raw: item.metadata?.content || {},
                            uri: item.uri,
                            primary: item.primary,
                            block_number: item.blockNumber,
                            owner: item.owner,
                            transactions: [
                                item.transactionHash,
                                ...(item.transactionHash !== item.updatedTransactionHash
                                    ? [item.updatedTransactionHash]
                                    : []),
                            ],
                        },
                    },
                    {
                        ...(item.metadata?.content?.name && { name: item.metadata.content.name }),
                        ...(item.metadata?.content?.bio && { bio: item.metadata.content.bio }),
                        ...(item.metadata?.content?.banners && {
                            banners: item.metadata.content.banners,
                        }),
                        ...(item.metadata?.content?.avatars && { avatars: item.metadata.content.avatars }),
                        ...(item.metadata?.content?.websites && { websites: item.metadata.content.websites }),
                        ...(item.metadata?.content?.tags && { tags: item.metadata.content.tags }),
                        ...(item.metadata?.content?.connected_accounts && {
                            connected_accounts: item.metadata.content.connected_accounts,
                        }),
                        ...(item.metadata?.content?.attributes && {
                            attributes: item.metadata?.content.attributes,
                        }),
                    },
                );
                return profile;
            }),
        );
        const result = {
            total: list.length,
            ...(response.cursor && { cursor: response.cursor }),
            list: list.map((profile) => {
                // Crossbell specification compatibility
                if (profile.connected_accounts) {
                    profile.connected_accounts = profile.connected_accounts.map((account) => {
                        if (typeof account === 'string') {
                            const match = account.match(/:\/\/account:(.*)@(.*)/);
                            if (match) {
                                return {
                                    identity: match[1],
                                    platform: match[2],
                                };
                            } else {
                                return {
                                    identity: account,
                                    platform: '',
                                };
                            }
                        }
                        return account;
                    });
                }
                return profile;
            }),
        };
        return result;
    }
    async set(options, input) {
        options = Object.assign(
            {
                platform: 'Ethereum',
                action: 'update',
            },
            options,
        );
        if (!this.contract) {
            this.contract = new crossbell_js_1.Contract(this.main.options.ethereumProvider);
            await this.contract.connect();
        }
        switch (options.action) {
            case 'update': {
                let character = await this.main.utils.getCrossbellCharacter({
                    identity: options.identity,
                    platform: options.platform,
                });
                if (!character) {
                    return {
                        code: 1,
                        message: 'Profile not found',
                    };
                }
                // setHandle
                if (input.username && input.username !== character.handle) {
                    await this.contract.setHandle(character.characterId + '', input.username);
                }
                // setProfileUri
                if (Object.keys(input).filter((key) => key !== 'username').length) {
                    const username = input.username || options.identity;
                    delete input.username;
                    // Crossbell specification compatibility
                    if (input.connected_accounts) {
                        input.connected_accounts = input.connected_accounts.map((account) => {
                            if (account.identity && account.platform) {
                                return `csb://account:${account.identity}@${account.platform.toLowerCase()}`;
                            } else {
                                return account;
                            }
                        });
                    }
                    const result = Object.assign({}, character.metadata?.content, input);
                    if (input.attributes && character.metadata?.content?.attributes) {
                        result.attributes = (0, lodash_es_1.unionBy)(
                            input.attributes,
                            character.metadata?.content.attributes,
                            'trait_type',
                        );
                    }
                    const ipfs = await this.main.utils.uploadToIPFS(result, username);
                    await this.contract.setCharacterUri(character.characterId + '', ipfs);
                    return {
                        code: 0,
                        message: 'Success',
                    };
                } else {
                    return {
                        code: 0,
                        message: 'Success',
                    };
                }
            }
            case 'add': {
                switch (options.platform) {
                    case 'Ethereum': {
                        const username = input.username || options.identity;
                        delete input.username;
                        const result = input;
                        const ipfs = await this.main.utils.uploadToIPFS(result, username);
                        await this.contract.createCharacter(options.identity, username, ipfs);
                        return {
                            code: 0,
                            message: 'Success',
                        };
                    }
                    default:
                        throw new Error(`Unsupported platform: ${options.platform}`);
                }
            }
            default:
                throw new Error(`Unsupported action: ${options.action}`);
        }
    }
}
exports.default = CrossbellProfile;
