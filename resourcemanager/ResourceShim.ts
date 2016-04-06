module RES.config {

    export interface Config {

        resources: ResourceCollection;

        groups: GroupCollection;

    }

    export interface GroupCollection {

        [name: string]: Group;

    }


    export interface Group {

        name: string;

        keys: string;

        state: resource.ResourceState;


    }

    export interface ResourceCollection {

        [name: string]: Resource;

    }

    export interface Resource {

        name: string;

        type: string;

        url: string;

        state: resource.ResourceState;
    }

}






class ResourceShim extends egret.EventDispatcher {

}

var shim: ResourceShim = new ResourceShim();

var resourceManager = new resource.Core();
resourceManager.resourceMatcher = (path) => {

    if (path.match(/.json/)) {
        return new resource.JsonResource();
    }
    else if (path.match(/.jpg/) || path.match(/.png/)) {
        return new resource.ImageResource();
    }
    return null;



}

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

    export var fs: resource.Core = new resource.Core();


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

    var resourceRootName: string;

    var config: config.Config;

    function onChange(type, resource: resource.ResourceFile) {

        console.log(`load ${type} : ${resource.path}`)

        if (resource.path == configFileName) {

            var data = resource.data;
            var groups: config.GroupCollection = {};
            var resources: config.ResourceCollection = {};
            const groupmapper = (group: config.Group) => groups[group.name] = group
            const resourcemapper = (resource: config.Resource) => resources[resource.name] = resource;
            data.groups.forEach(groupmapper);
            data.resources.forEach(resourcemapper);
            config = { resources, groups };
            shim.dispatchEvent(new ResourceEvent(RES.ResourceEvent.CONFIG_COMPLETE));
        }
    }

    export function loadConfig(configFile: string, resourceRoot: string) {
        configFileName = configFile;
        resourceRootName = resourceRoot
        resourceManager.onChange = onChange;
        resourceManager.preload(configFile);


    }




    function dispatchResourceEvent() {
        shim.dispatchEvent(new RES.ResourceEvent(RES.ResourceEvent.CONFIG_COMPLETE));
    }

    export function loadGroup(groupName) {

        let group = config.groups[groupName];
        let resourceNames = group.keys.split(",");
        let loadResource = (resourceName) => {
            let resource = config.resources[resourceName];
            if (resource) {
                resourceManager.preload(resourceRootName + "/" + resource.url);
            }
        }
        if (resourceNames) {
            resourceNames.forEach(loadResource);
        }
        console.log(`loadgroup:${groupName}`, JSON.stringify(group))
    }

    export function getRes(resourceName): any {
        return null;
    }

    export function getResAsync(name: string, callback: Function, thisObject: any) {

    }

}