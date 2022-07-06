'use strict';
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, '__esModule', { value: true });
const crossbell_js_1 = require('crossbell.js');
const mime_1 = __importDefault(require('mime'));
const web3_storage_1 = require('web3.storage');
class Utils {
    main;
    indexer;
    constructor(main) {
        this.main = main;
    }
    replaceIPFS(url) {
        if (/^[a-zA-Z0-9]{46}$/.test(url)) {
            url = 'ipfs://' + url;
        }
        return url.replace('ipfs://ipfs/', 'ipfs://').replace('ipfs://', this.main.options.ipfsGateway);
    }
    replaceIPFSs(urls) {
        return urls.map((url) => this.replaceIPFS(url));
    }
    async getCrossbellCharacter(options) {
        let profile;
        if (!this.indexer) {
            this.indexer = new crossbell_js_1.Indexer();
        }
        switch (options.platform) {
            case 'Ethereum':
                profile = await this.indexer.getPrimaryCharacter(options.identity);
                break;
            case 'Crossbell':
                profile = await this.indexer.getCharacterByHandle(options.identity);
                break;
            default:
                throw new Error(`Unsupported platform: ${options.platform}`);
        }
        return profile;
    }
    removeEmpty(obj, father) {
        for (let key in obj) {
            if (typeof obj[key] === 'object') {
                if (!obj[key] || Object.keys(obj[key]).length === 0) {
                    delete obj[key];
                } else {
                    this.removeEmpty(obj[key], {
                        obj,
                        key,
                    });
                }
            } else if (!obj[key]) {
                delete obj[key];
            }
        }
        if (Object.keys(obj).length === 0 && father) {
            delete father.obj[father.key];
        }
    }
    getMimeType(address) {
        address = this.main.utils.replaceIPFS(address);
        const mimeType = mime_1.default.getType(address);
        if (mimeType) {
            return mimeType;
        }
    }
    async uploadToIPFS(obj, filename = 'unidata') {
        const blob = new Blob([JSON.stringify(obj)], {
            type: 'application/json',
        });
        const file = new File([blob], `${filename}.json`);
        const web3Storage = new web3_storage_1.Web3Storage({
            token: this.main.options.web3StorageAPIToken,
        });
        const cid = await web3Storage.put([file], {
            name: file.name,
            maxRetries: 3,
            wrapWithDirectory: false,
        });
        return `ipfs://${cid}`;
    }
}
exports.default = Utils;
