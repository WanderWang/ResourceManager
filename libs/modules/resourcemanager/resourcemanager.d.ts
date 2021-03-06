declare module resource {
    enum State {
        UNLOADED = 0,
        LOADING = 1,
        LOADED = 2,
    }
    class Core {
        onChange: (type, resource: AbstructResource) => void;
        resourceMatcher: (url) => AbstructResource;
        private q;
        private fs;
        exists(): Boolean;
        readFile(path: string): AbstructResource;
        writeFile(r: AbstructResource): void;
        deleteFile(path: string): void;
        preload(path: string, priority?: number, callback?: (r: AbstructResource) => void): void;
    }
}
declare module resource {
    interface AbstructResource {
        path: string;
        realPath: string;
        data: any;
        preload(callback: any): any;
        load(callback: any): any;
        unload(): any;
        dispose(): any;
    }
    class JsonResource implements AbstructResource {
        path: string;
        realPath: string;
        data: any;
        callback: Function;
        preload(callback: any): void;
        private onComplete(e);
        load(callback: any): void;
        unload(): void;
        dispose(): void;
    }
    class TextureResource implements AbstructResource {
        path: string;
        realPath: string;
        data: egret.Texture;
        callback: Function;
        preload(callback: any): void;
        private onComplete(e);
        load(callback: any): void;
        unload(): void;
        dispose(): void;
    }
}
declare module RES.config {
    interface Config {
        resources: ResourceCollection;
        groups: GroupCollection;
    }
    interface GroupCollection {
        [name: string]: Group;
    }
    interface Group {
        name: string;
        keys: string;
        state: resource.State;
        resources: Array<Resource>;
    }
    interface ResourceCollection {
        [name: string]: Resource;
    }
    interface Resource {
        name: string;
        type: string;
        url: string;
        state: resource.State;
    }
}
declare class ResourceShim extends egret.EventDispatcher {
}
declare var shim: ResourceShim;
declare module RES {
    class ResourceItem {
        static TYPE_IMAGE: string;
    }
    class ResourceEvent extends egret.Event {
        groupName: string;
        itemsLoaded: number;
        itemsTotal: number;
        resItem: any;
    }
    interface ResourceItem {
        url: string;
    }
    var fs: resource.Core;
    module ResourceEvent {
        const CONFIG_COMPLETE: string;
        const GROUP_COMPLETE: string;
        const GROUP_LOAD_ERROR: string;
        const GROUP_PROGRESS: string;
        const ITEM_LOAD_ERROR: string;
    }
    function addEventListener(type: string, listener: Function, thisObject: any): void;
    function removeEventListener(type: string, listener: Function, thisObject: any): void;
    function resourceMatcher(path: any): resource.AbstructResource;
    function loadConfig(configFile: string, resourceRoot: string): void;
    function loadGroup(groupName: any, priority?: number): void;
    function getRes(resourceName: string): any;
    function getResAsync(resourceName: string, callback: Function, thisObject: any): void;
    /**
     * todo 应该判断name和subkey
     */
    function hasRes(resourceName: string): boolean;
    function getResByUrl(url: string, callback: Function, thisObject: any, type?: string): void;
    function destroyRes(name: string, force?: boolean): boolean;
    function isGroupLoaded(groupName: string): Boolean;
    function createGroup(groupName: any, resources: Array<any>, override?: Boolean): void;
}
declare var resourceManager: resource.Core;
