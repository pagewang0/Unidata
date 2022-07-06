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
const core_1 = require('@urql/core');
class CrossbellProfile extends base_1.default {
    indexer;
    contract;
    urqlClient;
    constructor(main) {
        super(main);
        crossbell_js_1.Network.setIpfsGateway(this.main.options.ipfsGateway);
    }
    async init() {
        this.urqlClient = (0, core_1.createClient)({
            url: 'https://indexer.crossbell.io/v1/graphql',
            maskTypename: false,
        });
    }
    async get(options) {
        if (!this.urqlClient) {
            this.init();
        }
        options = Object.assign(
            {
                platform: 'Ethereum',
            },
            options,
        );
        const response = await this.urqlClient
            .query(
                `
                query getCharacters($identity: String!, $limit: Int) {
                    characters( where: { ${
                        options.platform === 'Ethereum' ? 'owner' : 'handle'
                    }: { equals: $identity } }, orderBy: [{ createdAt: asc }], ${
                    options.cursor ? `cursor: { characterId: ${options.cursor}}, ` : ''
                }take: $limit ) {
                        handle
                        characterId
                        primary
                        uri
                        createdAt
                        updatedAt
                        metadata {
                            content
                        }
                        transactionHash
                        blockNumber
                        updatedTransactionHash
                        owner
                    }
                }`,
                {
                    identity: options.identity.toLowerCase(),
                    limit: options.limit,
                },
            )
            .toPromise();
        let list = [];
        if (response.data?.characters) {
            list = await Promise.all(
                response.data?.characters?.map(async (item) => {
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
                            ...(item.metadata?.content?.banners && { banners: item.metadata.content.banners }),
                            ...(item.metadata?.content?.avatars && { avatars: item.metadata.content.avatars }),
                            ...(item.metadata?.content?.websites && { websites: item.metadata.content.websites }),
                            ...(item.metadata?.content?.tags && { tags: item.metadata.content.tags }),
                            ...(item.metadata?.content?.connected_accounts && {
                                connected_accounts: item.metadata.content.connected_accounts,
                            }),
                        },
                    );
                    return profile;
                }),
            );
        }
        const result = {
            total: list.length,
            ...(options.limit && list.length >= options.limit && { cursor: list[list.length - 1].metadata.proof }),
            list: list.map((profile) => {
                // Crossbell specification compatibility
                if (profile.connected_accounts) {
                    profile.connected_accounts = profile.connected_accounts.map((account) => {
                        if (typeof account === 'string') {
                            const match = account.match(/:\/\/account:(.*)@(.*)/);
                            if (match) {
                                account = {
                                    identity: match[1],
                                    platform: match[2],
                                };
                            } else {
                                account = {
                                    identity: account,
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
