'use strict';
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, '__esModule', { value: true });
const base_1 = __importDefault(require('./base'));
const crossbell_js_1 = require('crossbell.js');
class CrossbellLink extends base_1.default {
    indexer;
    contract;
    constructor(main) {
        super(main);
    }
    async get(options) {
        if (!this.indexer) {
            this.indexer = new crossbell_js_1.Indexer();
        }
        options = Object.assign(
            {
                type: 'follow',
                platform: 'Ethereum',
            },
            options,
        );
        const character = await this.main.utils.getCrossbellCharacter({
            identity: options.identity,
            platform: options.platform,
        });
        let characterTo;
        if (options.filter?.to) {
            characterTo = await this.main.utils.getCrossbellCharacter({
                identity: options.filter?.to,
                platform: 'Crossbell',
            });
        }
        let res = await this.indexer[options.reversed ? 'getBacklinksOfCharacter' : 'getLinks'](
            character?.characterId + '',
            {
                linkType: options.type,
                limit: options.limit,
                cursor: options.cursor,
                ...(characterTo?.characterId && { toCharacterId: characterTo.characterId + '' }),
            },
        );
        const list = res?.list?.map((item) => ({
            date_created: item.createdAt,
            from: (options.reversed ? item.fromCharacter?.handle : character?.handle) || '',
            to: (options.reversed ? character?.handle : item.toCharacter?.handle) || '',
            type: options.type || '',
            source: 'Crossbell Link',
            metadata: {
                network: 'Crossbell',
                proof: item.transactionHash,
                block_number: item.blockNumber,
                from_owner: options.reversed ? item.fromCharacter?.owner : options.identity,
                to_owner: options.reversed ? options.identity : item.toCharacter?.owner,
            },
        }));
        return {
            total: res?.count,
            ...(res?.cursor && { cursor: res?.cursor }),
            list,
        };
    }
    async set(options, link) {
        options = Object.assign(
            {
                platform: 'Ethereum',
                action: 'add',
            },
            options,
        );
        if (!this.contract) {
            this.contract = new crossbell_js_1.Contract(this.main.options.ethereumProvider);
            await this.contract.connect();
        }
        let fromCharacterId = (
            await this.main.utils.getCrossbellCharacter({
                identity: options.identity,
                platform: options.platform,
            })
        )?.characterId;
        if (!fromCharacterId) {
            return {
                code: 1,
                message: 'Character not found',
            };
        }
        const toCharacterId = (
            await this.main.utils.getCrossbellCharacter({
                identity: link.to,
                platform: 'Crossbell',
            })
        )?.characterId;
        if (!toCharacterId) {
            return {
                code: 1,
                message: 'Character not found',
            };
        }
        switch (options.action) {
            case 'add': {
                await this.contract.linkCharacter(fromCharacterId + '', toCharacterId + '', link.type);
                return {
                    code: 0,
                    message: 'Success',
                };
            }
            case 'remove': {
                await this.contract.unlinkCharacter(fromCharacterId + '', toCharacterId + '', link.type);
                return {
                    code: 0,
                    message: 'Success',
                };
            }
            default:
                throw new Error(`Unsupported action: ${options.action}`);
        }
    }
}
exports.default = CrossbellLink;
