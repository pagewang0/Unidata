'use strict';
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, '__esModule', { value: true });
const base_1 = __importDefault(require('./base'));
const axios_1 = __importDefault(require('axios'));
class MirrorEntry extends base_1.default {
    constructor(main) {
        super(main);
    }
    async get(options) {
        const response = (
            await axios_1.default.get(`https://pregod.rss3.dev/v0.4.0/account:${options.identity}@ethereum/notes`, {
                params: {
                    item_sources: 'Mirror Entry',
                    limit: options.limit,
                    last_identifier: options.cursor,
                },
            })
        ).data;
        const result = {
            total: response.total,
            ...(new URL(response.identifier_next).searchParams.get('last_identifier') && {
                cursor: new URL(response.identifier_next).searchParams.get('last_identifier'),
            }),
            list: response.list.map((item) => {
                delete item.links;
                delete item.backlinks;
                item.id = item.identifier;
                delete item.identifier;
                item.authors = item.authors.map((author) => {
                    return {
                        identity: author.match(/account:(.*)@/)?.[1],
                        platform: author.match(/@(.*)$/)?.[1],
                    };
                });
                item.summary = {
                    content: item.summary,
                    mime_type: 'text/markdown',
                };
                if (!item.attachments) {
                    item.attachments = [];
                }
                item.attachments.forEach((attachment) => {
                    if (attachment.address) {
                        attachment.address = this.main.utils.replaceIPFS(attachment.address);
                    }
                    attachment.name = attachment.type;
                    delete attachment.type;
                    return attachment;
                });
                const body = item.attachments?.find((attachment) => attachment.name === 'body');
                if (body) {
                    item.body = body;
                    item.attachments = item.attachments.filter((attachment) => attachment.name !== 'body');
                    if (!item.attachments.length) {
                        delete item.attachments;
                    }
                    delete item.body.type;
                } else {
                    item.body = item.summary;
                }
                return item;
            }),
        };
        return result;
    }
    set;
}
exports.default = MirrorEntry;
