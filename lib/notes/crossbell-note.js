'use strict';
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, '__esModule', { value: true });
const base_1 = __importDefault(require('./base'));
const crossbell_js_1 = require('crossbell.js');
const web3_storage_1 = require('web3.storage');
class CrossbellNote extends base_1.default {
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
        let characterId;
        if (options.identity) {
            characterId = (
                await this.main.utils.getCrossbellCharacter({
                    identity: options.identity,
                    platform: options.platform,
                })
            )?.characterId;
            if (!characterId) {
                return {
                    total: 0,
                    list: [],
                };
            }
        }
        let res;
        if (options.filter?.id) {
            const note = await this.indexer.getNote(characterId + '', options.filter.id.split('-')[1]);
            if (note) {
                res = {
                    count: 1,
                    list: [note],
                };
            } else {
                res = {
                    count: 0,
                    list: [],
                };
            }
        } else {
            res = await this.indexer.getNotes({
                cursor: options.cursor,
                includeDeleted: false,
                limit: options.limit,
                ...(characterId && { characterId: characterId + '' }),
                ...(options.filter?.url && { toUri: options.filter?.url }),
            });
        }
        const list = await Promise.all(
            res?.list.map(async (event) => {
                const item = Object.assign(
                    {
                        date_published: event.createdAt,
                    },
                    event.metadata?.content,
                    {
                        id: `${characterId}-${event.noteId}`,
                        date_created: event.createdAt,
                        date_updated: event.updatedAt,
                        related_urls: [
                            ...(event.toUri ? [event.toUri] : []),
                            ...(event.uri ? [this.main.utils.replaceIPFS(event.uri)] : []),
                            `https://scan.crossbell.io/tx/${event.transactionHash}`,
                            ...(event.updatedTransactionHash && event.updatedTransactionHash !== event.transactionHash
                                ? [`https://scan.crossbell.io/tx/${event.updatedTransactionHash}`]
                                : []),
                        ],
                        authors: [options.identity],
                        source: 'Crossbell Note',
                        metadata: {
                            network: 'Crossbell',
                            proof: `${characterId}-${event.noteId}`,
                            block_number: event.blockNumber,
                            owner: event.owner,
                            transactions: [
                                event.transactionHash,
                                ...(event.transactionHash !== event.updatedTransactionHash
                                    ? [event.updatedTransactionHash]
                                    : []),
                            ],
                        },
                    },
                );
                // Crossbell specification compatibility
                if (item.summary) {
                    item.summary = {
                        content: item.summary,
                        mime_type: 'text/markdown',
                    };
                }
                if (item.content) {
                    item.body = {
                        content: item.content,
                        mime_type: 'text/markdown',
                    };
                    delete item.content;
                }
                if (item.attachments) {
                    item.attachments.forEach((attachment) => {
                        if (attachment.address) {
                            attachment.address = this.main.utils.replaceIPFS(attachment.address);
                        }
                        if (attachment.address && !attachment.mime_type) {
                            attachment.mime_type = this.main.utils.getMimeType(attachment.address);
                        }
                    });
                }
                return item;
            }),
        );
        return {
            total: res.count,
            ...(res.cursor && { cursor: res.cursor }),
            list: list,
        };
    }
    async set(options, input) {
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
        let characterId = (
            await this.main.utils.getCrossbellCharacter({
                identity: options.identity,
                platform: options.platform,
            })
        )?.characterId;
        if (!characterId) {
            return {
                code: 1,
                message: 'Character not found',
            };
        }
        // Crossbell specification compatibility
        if (input.body) {
            input.content = input.body.content;
            delete input.body;
        }
        if (input.summary) {
            input.summary = input.summary.content;
        }
        let url;
        if (input.related_urls) {
            if (input.related_urls.length > 1) {
                throw new Error('Only one related_url is allowed');
            } else {
                url = input.related_urls[0];
                delete input.related_urls;
            }
        }
        switch (options.action) {
            case 'add': {
                const web3Storage = new web3_storage_1.Web3Storage({
                    token: this.main.options.web3StorageAPIToken,
                });
                const blob = new Blob([JSON.stringify(input)], {
                    type: 'application/json',
                });
                const file = new File([blob], `${options.identity}.json`);
                const cid = await web3Storage.put([file], {
                    name: file.name,
                    maxRetries: 3,
                    wrapWithDirectory: false,
                });
                let data;
                if (url) {
                    data = await this.contract.postNoteForAnyUri(characterId + '', `ipfs://${cid}`, url);
                } else {
                    data = await this.contract.postNote(characterId + '', `ipfs://${cid}`);
                }
                return {
                    code: 0,
                    message: 'Success',
                    data: data.data.noteId,
                };
            }
            case 'remove': {
                if (!input.id) {
                    return {
                        code: 1,
                        message: 'Missing id',
                    };
                } else if (input.id.split('-')[0] !== characterId + '') {
                    return {
                        code: 1,
                        message: 'Wrong id',
                    };
                } else {
                    await this.contract.deleteNote(characterId + '', input.id.split('-')[1]);
                    return {
                        code: 0,
                        message: 'Success',
                    };
                }
            }
            case 'update': {
                if (!input.id) {
                    return {
                        code: 1,
                        message: 'Missing id',
                    };
                } else if (input.id.split('-')[0] !== characterId + '') {
                    return {
                        code: 1,
                        message: 'Wrong id',
                    };
                } else {
                    if (!this.indexer) {
                        this.indexer = new crossbell_js_1.Indexer();
                    }
                    const note = await this.indexer.getNote(characterId + '', input.id.split('-')[1]);
                    if (!note) {
                        return {
                            code: 1,
                            message: 'Note not found',
                        };
                    } else {
                        const id = input.id;
                        delete input.id;
                        const result = Object.assign({}, note.metadata?.content, input);
                        const ipfs = await this.main.utils.uploadToIPFS(result, id);
                        await this.contract.setNoteUri(characterId + '', id.split('-')[1], ipfs);
                        return {
                            code: 0,
                            message: 'Success',
                        };
                    }
                }
            }
            default:
                throw new Error(`Unsupported action: ${options.action}`);
        }
    }
}
exports.default = CrossbellNote;
