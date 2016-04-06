var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var resource;
(function (resource_1) {
    var ResourceState;
    (function (ResourceState) {
        ResourceState[ResourceState["UNLOADED"] = 0] = "UNLOADED";
        ResourceState[ResourceState["LOADING"] = 1] = "LOADING";
        ResourceState[ResourceState["LOADED"] = 2] = "LOADED";
    })(ResourceState || (ResourceState = {}));
    var Core = (function () {
        function Core() {
        }
        Core.prototype.exists = function () {
            return true;
        };
        Core.prototype.readFile = function (path) {
            return new ImageResource();
        };
        Core.prototype.writeFile = function () {
        };
        Core.prototype.preload = function (path) {
            var _this = this;
            var paths = [];
            if (typeof path === "string") {
                paths = [path];
            }
            else {
                paths = path;
            }
            var tasks = paths.map(function (p) {
                var resource = _this.resourceMatcher(p);
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
        return Core;
    }());
    resource_1.Core = Core;
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
    resource_1.JsonResource = JsonResource;
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
    resource_1.ImageResource = ImageResource;
})(resource || (resource = {}));
var ResourceShim = (function (_super) {
    __extends(ResourceShim, _super);
    function ResourceShim() {
        _super.apply(this, arguments);
    }
    return ResourceShim;
}(egret.EventDispatcher));
var shim = new ResourceShim();
var resourceManager = new resource.Core();
resourceManager.resourceMatcher = function (path) {
    if (path.match(/.json/)) {
        return new resource.JsonResource();
    }
    else if (path.match(/.jpg/) || path.match(/.png/)) {
        return new resource.ImageResource();
    }
    return null;
};
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
    RES.fs = new resource.Core();
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
    var resourceRootName;
    var config;
    function onChange(type, resource) {
        console.log("load " + type + " : " + resource.path);
        if (resource.path == configFileName) {
            var data = resource.data;
            var groups = {};
            var resources = {};
            var groupmapper = function (group) { return groups[group.name] = group; };
            var resourcemapper = function (resource) { return resources[resource.name] = resource; };
            data.groups.forEach(groupmapper);
            data.resources.forEach(resourcemapper);
            config = { resources: resources, groups: groups };
            shim.dispatchEvent(new ResourceEvent(RES.ResourceEvent.CONFIG_COMPLETE));
        }
    }
    function loadConfig(configFile, resourceRoot) {
        configFileName = configFile;
        resourceRootName = resourceRoot;
        resourceManager.onChange = onChange;
        resourceManager.preload(configFile);
    }
    RES.loadConfig = loadConfig;
    function dispatchResourceEvent() {
        shim.dispatchEvent(new RES.ResourceEvent(RES.ResourceEvent.CONFIG_COMPLETE));
    }
    function loadGroup(groupName) {
        var group = config.groups[groupName];
        var resourceNames = group.keys.split(",");
        var loadResource = function (resourceName) {
            var resource = config.resources[resourceName];
            if (resource) {
                resourceManager.preload(resourceRootName + "/" + resource.url);
            }
        };
        if (resourceNames) {
            resourceNames.forEach(loadResource);
        }
        console.log("loadgroup:" + groupName, JSON.stringify(group));
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
