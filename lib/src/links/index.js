'use strict';
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, '__esModule', { value: true });
const crossbell_link_1 = __importDefault(require('./crossbell-link'));
class Links {
    map;
    constructor(main) {
        this.map = {
            'Crossbell Link': new crossbell_link_1.default(main),
        };
    }
    async get(options) {
        return this.map[options.source].get(options);
    }
    async set(options, input) {
        if (this.map[options.source].set) {
            return this.map[options.source].set(options, input);
        } else {
            return {
                code: 1,
                message: 'Method not implemented',
            };
        }
    }
}
exports.default = Links;
