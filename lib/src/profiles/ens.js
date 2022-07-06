'use strict';
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, '__esModule', { value: true });
const base_1 = __importDefault(require('./base'));
const ethers_1 = require('ethers');
const core_1 = require('@urql/core');
class ENS extends base_1.default {
    ethersProvider;
    urqlClient;
    constructor(main) {
        super(main);
    }
    async init() {
        this.ethersProvider = new ethers_1.ethers.providers.InfuraProvider(
            'homestead',
            this.main.options.infuraProjectID,
        );
        this.urqlClient = (0, core_1.createClient)({
            url: 'https://api.thegraph.com/subgraphs/name/ensdomains/ens',
            maskTypename: false,
        });
        this.inited = true;
    }
    async get(options) {
        if (!this.inited) {
            await this.init();
        }
        const result = await this.urqlClient
            .query(
                `
                query getRegistrations($identity: ID!, $limit: Int, $cursor: Int) {
                    account(id: $identity) {
                    domains(orderBy: createdAt, orderDirection: "desc", skip: $cursor, first: $limit) {
                        id
                        name
                        createdAt
                        labelhash
                        resolver {
                            texts
                            id
                                address
                            }
                        }
                    }
                }`,
                {
                    identity: options.identity.toLowerCase(),
                    cursor: options.cursor || 0,
                    limit: options.limit,
                },
            )
            .toPromise();
        const list =
            (await Promise.all(
                result?.data?.account?.domains?.map(async (domain) => {
                    const profile = {
                        date_created: new Date(+domain.createdAt).toISOString(),
                        name: domain.name,
                        username: domain.name,
                        source: 'ENS',
                        metadata: {
                            network: 'Ethereum',
                            proof: domain.name,
                        },
                    };
                    const resolver = await this.ethersProvider.getResolver(domain.name);
                    if (resolver) {
                        const fields = domain.resolver?.texts || [];
                        await Promise.all(
                            fields.map(async (field) => {
                                switch (field) {
                                    case 'avatar':
                                        profile.avatars = [await resolver.getText(field)];
                                        break;
                                    case 'description':
                                        profile.bio = await resolver.getText(field);
                                        break;
                                    case 'url':
                                        profile.websites = [await resolver.getText(field)];
                                        break;
                                    default:
                                        const split = field.split('.');
                                        if (split.length === 2 && (split[0] === 'com' || split[0] === 'org')) {
                                            if (!profile.connected_accounts) {
                                                profile.connected_accounts = [];
                                            }
                                            profile.connected_accounts.push({
                                                identity: await resolver.getText(field),
                                                platform: split[1],
                                            });
                                        }
                                        break;
                                }
                            }),
                        );
                    }
                    return profile;
                }),
            )) || [];
        return {
            total: list.length,
            ...(options.limit && list.length >= options.limit && { cursor: options.limit + (options.cursor || 0) }),
            list,
        };
    }
    set;
}
exports.default = ENS;
