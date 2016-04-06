var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ResourceState;
(function (ResourceState) {
    ResourceState[ResourceState["UNLOADED"] = 0] = "UNLOADED";
    ResourceState[ResourceState["LOADING"] = 1] = "LOADING";
    ResourceState[ResourceState["LOADED"] = 2] = "LOADED";
})(ResourceState || (ResourceState = {}));
var ResourceManager = (function () {
    function ResourceManager() {
    }
    ResourceManager.prototype.exists = function () {
        return true;
    };
    ResourceManager.prototype.readFile = function (path) {
        return new ImageResource();
    };
    ResourceManager.prototype.writeFile = function () {
    };
    ResourceManager.prototype.preload = function (path) {
        var _this = this;
        var paths = [];
        if (typeof path === "string") {
            paths = [path];
        }
        else {
            paths = path;
        }
        var tasks = paths.map(function (p) {
            var resource = new JsonResource();
            resource.path = p;
            return resource;
        });
        var q = async.priorityQueue(function (task, callback) {
            console.log('load ' + task.path);
            task.preload(function () {
                _this.onChange("complete", task);
                callback();
            });
        }, 2);
        this.q = q;
        // assign a callback
        q.drain = function () {
            console.log('all items have been processed');
            // q.push({ name: 'foo1' }, 0, function (err) {
            //     console.log('finished processing foo1');
            //     q.resume();
            // });
        };
        // add some items to the queue
        q.push(tasks, 0, function (err) {
            console.log('finished processing foo');
        });
    };
    return ResourceManager;
}());
var JsonResource = (function () {
    function JsonResource() {
    }
    JsonResource.prototype.preload = function (callback) {
        this.callback = callback;
        var request = new egret.URLRequest(this.path);
        var loader = new egret.URLLoader();
        loader.dataFormat = egret.URLLoaderDataFormat.TEXT;
        loader.addEventListener(egret.Event.COMPLETE, this.onComplete, this);
        loader.load(request);
    };
    JsonResource.prototype.onComplete = function (e) {
        var loader = e.target;
        loader.removeEventListener(egret.Event.COMPLETE, this.onComplete, this);
        var text = loader.data;
        this.data = JSON.parse(text);
        this.callback();
    };
    JsonResource.prototype.load = function (callback) {
    };
    JsonResource.prototype.unload = function () {
    };
    JsonResource.prototype.dispose = function () {
    };
    return JsonResource;
}());
var ImageResource = (function () {
    function ImageResource() {
    }
    ImageResource.prototype.preload = function (callback) {
        var request = new egret.URLRequest(this.path);
        var loader = new egret.URLLoader();
        loader.dataFormat = egret.URLLoaderDataFormat.TEXTURE;
        loader.addEventListener(egret.Event.COMPLETE, this.onComplete, this);
        loader.load(request);
    };
    ImageResource.prototype.onComplete = function (e) {
        var loader = e.target;
        loader.removeEventListener(egret.Event.COMPLETE, this.onComplete, this);
        var texture = loader.data;
        this.data = texture;
    };
    ImageResource.prototype.load = function (callback) {
    };
    ImageResource.prototype.unload = function () {
    };
    ImageResource.prototype.dispose = function () {
    };
    return ImageResource;
}());
var ResourceShim = (function (_super) {
    __extends(ResourceShim, _super);
    function ResourceShim() {
        _super.apply(this, arguments);
    }
    return ResourceShim;
}(egret.EventDispatcher));
var shim = new ResourceShim();
var resourceManager = new ResourceManager();
var RES;
(function (RES) {
    var ResourceEvent = (function (_super) {
        __extends(ResourceEvent, _super);
        function ResourceEvent() {
            _super.apply(this, arguments);
        }
        return ResourceEvent;
    }(egret.Event));
    RES.ResourceEvent = ResourceEvent;
    RES.fs = new ResourceManager();
    var ResourceEvent;
    (function (ResourceEvent) {
        ResourceEvent.CONFIG_COMPLETE = "CONFIG_COMPLETE";
        ResourceEvent.GROUP_COMPLETE = "GROUP_COMPLETE";
        ResourceEvent.GROUP_LOAD_ERROR = "GROUP_LOAD_ERROR";
        ResourceEvent.GROUP_PROGRESS = "GROUP_PROGRESS";
        ResourceEvent.ITEM_LOAD_ERROR = "ITEM_LOAD_ERROR";
    })(ResourceEvent = RES.ResourceEvent || (RES.ResourceEvent = {}));
    function addEventListener(type, listener, thisObject) {
        shim.addEventListener(type, listener, thisObject);
    }
    RES.addEventListener = addEventListener;
    function removeEventListener(type, listener, thisObject) {
        shim.removeEventListener(type, listener, thisObject);
    }
    RES.removeEventListener = removeEventListener;
    var configFileName;
    function onChange(type, resource) {
        if (resource.path == configFileName) {
            config = resource.data;
            shim.dispatchEvent(new ResourceEvent(RES.ResourceEvent.CONFIG_COMPLETE));
        }
    }
    function loadConfig(configFile, resourceRoot) {
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
    RES.loadConfig = loadConfig;
    var config;
    function onConfigLoadComplete(e) {
        var loader = e.target;
        loader.removeEventListener(egret.Event.COMPLETE, onConfigLoadComplete, this);
        config = loader.data;
        console.log(JSON.stringify(config));
    }
    function dispatchResourceEvent() {
        shim.dispatchEvent(new RES.ResourceEvent(RES.ResourceEvent.CONFIG_COMPLETE));
    }
    function loadGroup(groupName) {
        console.log(groupName, config);
    }
    RES.loadGroup = loadGroup;
    function getRes(resourceName) {
        return null;
    }
    RES.getRes = getRes;
    function getResAsync(name, callback, thisObject) {
    }
    RES.getResAsync = getResAsync;
})(RES || (RES = {}));
