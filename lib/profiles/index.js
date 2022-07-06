'use strict';
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, '__esModule', { value: true });
const ens_1 = __importDefault(require('./ens'));
const crossbell_profile_1 = __importDefault(require('./crossbell-profile'));
class Profiles {
    main;
    map;
    accountsMap;
    constructor(main) {
        this.main = main;
        this.map = {
            ENS: new ens_1.default(main),
            'Crossbell Profile': new crossbell_profile_1.default(main),
        };
        this.accountsMap = {
            github: {
                platform: 'GitHub',
                url: 'https://github.com/$$id',
            },
            twitter: {
                platform: 'Twitter',
                url: 'https://twitter.com/$$id',
            },
            telegram: {
                platform: 'Telegram',
                url: 'https://t.me/$$id',
            },
            discord: {
                platform: 'Discord',
            },
            reddit: {
                platform: 'Reddit',
                url: 'https://www.reddit.com/user/$$id',
            },
            jike: {
                platform: 'Jike',
                url: 'https://web.okjike.com/u/$$id',
            },
        };
    }
    async get(options) {
        const result = await this.map[options.source].get(options);
        result.list = result.list.map((profile) => {
            if (profile.avatars) {
                profile.avatars = this.main.utils.replaceIPFSs(profile.avatars);
            }
            if (profile.banners) {
                profile.banners = this.main.utils.replaceIPFSs(profile.banners);
            }
            if (profile.connected_accounts) {
                profile.connected_accounts = profile.connected_accounts.map((account) => {
                    const rule = this.accountsMap[account.platform.toLowerCase()];
                    if (rule) {
                        account.platform = rule.platform;
                        if (rule.url) {
                            account.url = rule.url.replace('$$id', account.identity);
                        }
                    }
                    return account;
                });
            }
            return profile;
        });
        return result;
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
exports.default = Profiles;
