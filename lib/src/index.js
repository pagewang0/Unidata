'use strict';
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, '__esModule', { value: true });
const utils_1 = __importDefault(require('./utils'));
const profiles_1 = __importDefault(require('./profiles'));
const links_1 = __importDefault(require('./links'));
const assets_1 = __importDefault(require('./assets'));
const notes_1 = __importDefault(require('./notes'));
const package_json_1 = require('../package.json');
console.log(
    `${'\n'} %c Unidata v${package_json_1.version} %c https://unidata.app ${'\n'}`,
    'color: #fecc02; background: #030307; padding: 5px 0;',
    'background: #fecc02; padding: 5px 0;',
);
class Unidata {
    options;
    utils;
    profiles;
    links;
    assets;
    notes;
    constructor(options) {
        this.options = Object.assign(
            {},
            {
                ipfsGateway: 'https://gateway.ipfs.io/ipfs/',
                web3StorageAPIToken:
                    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDAyMDIwODZmRjU5OUU0Y0YyMzM4MkUzNjg1Y0NmZUEyOGNBODBCOTAiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NTIzNjM1Njk3NDUsIm5hbWUiOiJVbmlkYXRhIn0.XmsAuXvbTj4BFhZlJK4xXfbd0ltVZJCEhqdYcW_kLOo',
                ...(typeof window !== 'undefined' && { ethereumProvider: window.ethereum }),
            },
            options,
        );
        this.utils = new utils_1.default(this);
        this.profiles = new profiles_1.default(this);
        this.links = new links_1.default(this);
        this.assets = new assets_1.default(this);
        this.notes = new notes_1.default(this);
    }
}
exports.default = Unidata;
