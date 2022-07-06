import Utils from './utils';
import ProfilesC from './profiles';
import LinksC from './links';
import AssetsC from './assets';
import NotesC from './notes';
import type { Asset, Assets, Note, Notes, Link, Links, Profile, Profiles } from './specifications';
export { Asset, Assets, Note, Notes, Link, Links, Profile, Profiles };
declare type IOptions = {
    infuraProjectID?: string;
    ipfsGateway?: string;
    moralisWeb3APIKey?: string;
    openseaAPIKey?: string;
    alchemyEthereumAPIKey?: string;
    alchemyPolygonAPIKey?: string;
    alchemyFlowAPIKey?: string;
    web3StorageAPIToken?: string;
    ethereumProvider?: any;
    nftscanAPIKey?: string;
};
declare class Unidata {
    options: IOptions;
    utils: Utils;
    profiles: ProfilesC;
    links: LinksC;
    assets: AssetsC;
    notes: NotesC;
    constructor(options?: IOptions);
}
export default Unidata;
