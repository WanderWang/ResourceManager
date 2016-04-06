module resconfig {

    export interface ResConfig {

        resources: ResResourceCollection;

        groups: ResGroupCollection;

    }

    export interface ResGroupCollection {

        [name: string]: ResGroup;

    }


    export interface ResGroup {

        name: string;

        keys: string;


    }

    export interface ResResourceCollection {

        [name: string]: string;

    }

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

    var config: resconfig.ResConfig;

    function onChange(type, resource: ResourceFile) {
        if (resource.path == configFileName) {

            var data = resource.data;
            var groups: resconfig.ResGroupCollection = {};
            var resources:resconfig.ResResourceCollection = {};
            const groupmapper = (group: resconfig.ResGroup) => groups[group.name] = group
            data.groups.map(groupmapper);
            config = {resources,groups};
            shim.dispatchEvent(new ResourceEvent(RES.ResourceEvent.CONFIG_COMPLETE));
        }
    }

    export function loadConfig(configFile: string, resourceRoot: string) {
        configFileName = configFile;
        resourceManager.onChange = onChange;
        resourceManager.preload(configFile);


    }




    function dispatchResourceEvent() {
        shim.dispatchEvent(new RES.ResourceEvent(RES.ResourceEvent.CONFIG_COMPLETE));
    }

    export function loadGroup(groupName) {

        var group = config.groups[groupName];
        console.log(`loadgroup:${groupName}`, JSON.stringify(group))
    }

    export function getRes(resourceName): any {
        return null;
    }

    export function getResAsync(name: string, callback: Function, thisObject: any) {

    }

}