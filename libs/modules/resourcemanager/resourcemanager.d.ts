declare module resource {
    class Core {
        onChange: (type, resource: ResourceFile) => void;
        resourceMatch: Function;
        private q;
        private config;
        exists(): Boolean;
        readFile(path: string): ResourceFile;
        writeFile(): void;
        preload(path: string | Array<string>): void;
    }
    interface ResourceFile {
        path: string;
        data: any;
        preload(callback: any): any;
        load(callback: any): any;
        unload(): any;
        dispose(): any;
    }
    class JsonResource implements ResourceFile {
        path: string;
        data: any;
        callback: Function;
        preload(callback: any): void;
        private onComplete(e);
        load(callback: any): void;
        unload(): void;
        dispose(): void;
    }
    class ImageResource implements ResourceFile {
        path: string;
        data: egret.Texture;
        preload(callback: any): void;
        private onComplete(e);
        load(callback: any): void;
        unload(): void;
        dispose(): void;
    }
}
declare module resconfig {
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
    }
    interface ResourceCollection {
        [name: string]: Resource;
    }
    interface Resource {
        name: string;
        type: string;
        url: string;
    }
}
declare class ResourceShim extends egret.EventDispatcher {
}
declare var shim: ResourceShim;
declare var resourceManager: resource.Core;
declare module RES {
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
    function loadConfig(configFile: string, resourceRoot: string): void;
    function loadGroup(groupName: any): void;
    function getRes(resourceName: any): any;
    function getResAsync(name: string, callback: Function, thisObject: any): void;
}
