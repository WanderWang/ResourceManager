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

        state: resource.State;

        resources: Array<Resource>;


    }

    export interface ResourceCollection {

        [name: string]: Resource;

    }

    export interface Resource {

        name: string;

        type: string;

        url: string;

        state: resource.State;
    }

}






class ResourceShim extends egret.EventDispatcher {

}

var shim: ResourceShim = new ResourceShim();



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
    
    export function resourceMatcher(path){
    var result:resource.ResourceFile;
    if (path.match(/.json/)) {
        result = new resource.JsonResource();
    }
    else if (path.match(/.jpg/) || path.match(/.png/)) {
        result = new resource.ImageResource();
    }
    result.path = path;
    var realpath;
    if (path.indexOf(resourceRootName) == -1){
        realpath = resourceRootName + path; 
    }
    else{
        realpath = path;
    }
    result.realPath = realpath;
    return result;



}

    var configFileName: string;

    var resourceRootName: string;

    var config: config.Config;
    

    function onChange(type, resourceFile: resource.ResourceFile) {

        console.log(`load ${type} : ${resourceFile.path}`)

        if (resourceFile.path == configFileName) {

            let data = resourceFile.data;
            let groups: config.GroupCollection = {};
            let resources: config.ResourceCollection = {};

            const resourcemapper = (resourceConfig: config.Resource) => {
                resources[resourceConfig.name] = resourceConfig;
                resourceConfig.state = resource.State.UNLOADED;
            }
            data.resources.forEach(resourcemapper);

            const groupmapper = (group: config.Group) => {
                groups[group.name] = group;
                let resourceNames = group.keys.split(",");
                group.resources = resourceNames.map((resourceName) => resources[resourceName]);
            }
            data.groups.forEach(groupmapper);

            config = { resources, groups };
            shim.dispatchEvent(new ResourceEvent(RES.ResourceEvent.CONFIG_COMPLETE));

            //test
            window['config'] = config;

        }
        else {

            var resourceConfig = getResourceFromUrl(resourceFile.path);
            resourceConfig.state = resource.State.LOADED;
            for (var groupName in config.groups) {
                var group = config.groups[groupName];
                if (group.resources.every(isLoaded)) {
                    if (group.state != resource.State.LOADED) {
                        group.state = resource.State.LOADED;
                        var event = new RES.ResourceEvent(RES.ResourceEvent.GROUP_COMPLETE);
                        event.groupName = group.name;
                        shim.dispatchEvent(event);
                    }
                }
            }
        }
    }

    function isLoaded(resourceConfig: config.Resource) {
        return resourceConfig.state == resource.State.LOADED;
    }

    function getResourceFromUrl(url): config.Resource {
        var resources = config.resources;
        for (var key in resources) {
            var resource = resources[key];
            if (resource.url === url) {
                return resource;
            }
        }
        return null;
    }

    export function loadConfig(configFile: string, resourceRoot: string) {
        configFileName = configFile;
        resourceRootName = resourceRoot
        resourceManager.onChange = onChange;
        resourceManager.preload(configFile);


    }

    export function loadGroup(groupName) {

        let group = config.groups[groupName];
        let resourceNames = group.keys.split(",");
        let loadResource = (resourceName) => {
            let resource = config.resources[resourceName];
            if (resource) {
                resourceManager.preload(resource.url);
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


var resourceManager = new resource.Core();
resourceManager.resourceMatcher = RES.resourceMatcher;