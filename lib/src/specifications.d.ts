declare type AccountInstanceURI = string;
declare type InstanceURI = string;
declare type URI = string;
declare type Network = string;
declare type LinkType = string;
declare type ProfileSource = string;
declare type LinkSource = string;
declare type AssetSource = string;
declare type NoteSource = string;
export declare type Profile = {
    date_created?: string;
    date_updated?: string;
    name?: string;
    username?: string;
    avatars?: URI[];
    bio?: string;
    websites?: URI[];
    banners?: URI[];
    tags?: string[];
    connected_accounts?: {
        identity: string;
        platform: string;
        url?: string;
    }[];
    source: ProfileSource;
    metadata?: {
        network: Network;
        proof: string;
        [key: string]: any;
    };
};
export declare type Profiles = {
    total: number;
    list: Profile[];
};
export declare type Link = {
    date_created?: string;
    from: InstanceURI;
    to: InstanceURI;
    type: LinkType;
    source: LinkSource;
    metadata?: {
        network: Network;
        proof: string;
        [key: string]: any;
    };
};
export declare type Links = {
    total: number;
    cursor?: any;
    list: Link[];
};
export declare type Note = {
    id: string;
    date_created: string;
    date_updated: string;
    date_published: string;
    related_urls?: string[];
    tags?: string[];
    authors: AccountInstanceURI[];
    title?: string;
    summary?: {
        content?: string;
        address?: URI;
        mime_type?: string;
        size_in_bytes?: number;
    };
    body?: {
        content?: string;
        address?: URI;
        mime_type?: string;
        size_in_bytes?: number;
    };
    attachments?: {
        name?: string;
        content?: string;
        address?: URI;
        mime_type?: string;
        size_in_bytes?: number;
    }[];
    source: NoteSource;
    metadata?: {
        network: Network;
        proof: string;
        [key: string]: any;
    };
};
export declare type Notes = {
    total: number;
    cursor?: any;
    list: Note[];
};
export declare type Asset = {
    date_created?: string;
    date_updated?: string;
    related_urls?: string[];
    tags?: string[];
    owners: AccountInstanceURI[];
    name?: string;
    description?: string;
    previews?: {
        content?: string;
        address?: URI;
        mime_type?: string;
        size_in_bytes?: number;
    }[];
    items?: {
        content?: string;
        address?: URI;
        mime_type?: string;
        size_in_bytes?: number;
    }[];
    attributes?: {
        key: string;
        value: string;
    }[];
    source: AssetSource;
    metadata?: {
        network: Network;
        proof: string;
        providers: string[];
        [key: string]: any;
    };
};
export declare type Assets = {
    total: number;
    cursor?: any;
    list: Asset[];
};
export {};
