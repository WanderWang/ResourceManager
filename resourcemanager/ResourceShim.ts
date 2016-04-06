
interface ResConfig {

    resources: Array<ResResourceConfig>;

    groups: Array<ResGroupConfig>;


}

interface ResGroupConfig {

    name: string;

    keys: string;

}

interface ResResourceConfig {

    name: string;

    type: string;

    url: string;

}



class ResourceShim extends egret.EventDispatcher {

}

var shim: ResourceShim = new ResourceShim();

var resourceManager = new ResourceManager();

module RES {

    export class ResourceEvent extends egret.Event {

        groupName: string;

        itemsLoaded: number;

        itemsTotal: number;

        resItem: any
    }

    export interface ResourceItem {

        url: string;
    }

    export var fs: ResourceManager = new ResourceManager();


    export module ResourceEvent {

        export const CONFIG_COMPLETE = "CONFIG_COMPLETE";

        export const GROUP_COMPLETE = "GROUP_COMPLETE";

        export const GROUP_LOAD_ERROR = "GROUP_LOAD_ERROR";

        export const GROUP_PROGRESS = "GROUP_PROGRESS";

        export const ITEM_LOAD_ERROR = "ITEM_LOAD_ERROR";

    }

    export function addEventListener(type: string, listener: Function, thisObject: any) {
        shim.addEventListener(type, listener, thisObject);
    }

    export function removeEventListener(type: string, listener: Function, thisObject: any) {
        shim.removeEventListener(type, listener, thisObject);
    }

    var configFileName: string;

    function onChange(type, resource: ResourceFile) {
        if (resource.path == configFileName) {
            config = resource.data;
            shim.dispatchEvent(new ResourceEvent(RES.ResourceEvent.CONFIG_COMPLETE));
        }
    }

    export function loadConfig(configFile: string, resourceRoot: string) {
        configFileName = configFile;
        resourceManager.onChange = onChange;
        resourceManager.preload(configFile);
        return;

        // var request = new egret.URLRequest(configFile);
        // var loader = new egret.URLLoader();
        // loader.dataFormat = egret.URLLoaderDataFormat.TEXT;
        // loader.addEventListener(egret.Event.COMPLETE,onConfigLoadComplete,this);
        // loader.load(request);

        // setTimeout(()=> dispatchResourceEvent(),1000);
    }


    var config: ResConfig;

    function onConfigLoadComplete(e: egret.Event) {
        var loader: egret.URLLoader = <egret.URLLoader>e.target;
        loader.removeEventListener(egret.Event.COMPLETE, onConfigLoadComplete, this);
        config = loader.data;
        console.log(JSON.stringify(config));
    }

    function dispatchResourceEvent() {
        shim.dispatchEvent(new RES.ResourceEvent(RES.ResourceEvent.CONFIG_COMPLETE));
    }

    export function loadGroup(groupName) {
        console.log(groupName, config)
    }

    export function getRes(resourceName): any {
        return null;
    }

    export function getResAsync(name: string, callback: Function, thisObject: any) {

    }

}