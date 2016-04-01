class ResourceShim extends egret.EventDispatcher {

}




var shim:ResourceShim = new ResourceShim();

var resourceManager = new ResourceManager();

module RES {

    export class ResourceEvent extends egret.Event{

        groupName: string;

        itemsLoaded: number;

        itemsTotal: number;
    }
    
    export var fs:ResourceManager = new ResourceManager();


    export module ResourceEvent {

        export var CONFIG_COMPLETE = "CONFIG_COMPLETE";

        export var GROUP_COMPLETE = "GROUP_COMPLETE";

        export var GROUP_LOAD_ERROR = "GROUP_LOAD_ERROR";

        export var GROUP_PROGRESS = "GROUP_PROGRESS";
    }

    export function addEventListener(type: string, listener: Function, thisObject: any) {
        shim.addEventListener(type, listener, thisObject);
    }

    export function removeEventListener(type: string, listener: Function, thisObject: any) {
        shim.removeEventListener(type, listener, thisObject);
    }

    export function loadConfig(configFile: string, resourceRoot: string) {
       
       var onChange = (type,resource:ResourceFile) => {
           shim.dispatchEvent(new ResourceEvent(RES.ResourceEvent.CONFIG_COMPLETE));
       }
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
    
    
    var config;
    
    function onConfigLoadComplete(e:egret.Event){
        var loader:egret.URLLoader = <egret.URLLoader>e.target;
        loader.removeEventListener(egret.Event.COMPLETE,onConfigLoadComplete,this);
        config = JSON.parse(loader.data);
    }
    
    function dispatchResourceEvent(){
        shim.dispatchEvent(new RES.ResourceEvent(RES.ResourceEvent.CONFIG_COMPLETE));
    }

    export function loadGroup(groupName) {
        console.log (groupName,config)
    }

    export function getRes(resourceName): any {
        return null;
    }

    export function getResAsync(name: string, callback: Function, thisObject: any) {

    }

}