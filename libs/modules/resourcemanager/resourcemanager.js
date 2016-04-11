var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var resource;
(function (resource_1) {
    // interface ResourceConfig {
    //     loadedState: State;
    // }
    (function (State) {
        State[State["UNLOADED"] = 0] = "UNLOADED";
        State[State["LOADING"] = 1] = "LOADING";
        State[State["LOADED"] = 2] = "LOADED";
    })(resource_1.State || (resource_1.State = {}));
    var State = resource_1.State;
    var Core = (function () {
        function Core() {
            this.fs = {};
        }
        Core.prototype.exists = function () {
            return true;
        };
        Core.prototype.readFile = function (path) {
            return this.fs[path];
        };
        Core.prototype.writeFile = function (r) {
            this.fs[r.path] = r;
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
            var tasks = paths.map(this.resourceMatcher);
            var q = async.priorityQueue(function (r, callback) {
                console.log('load ' + r.path);
                r.preload(function () {
                    _this.writeFile(r);
                    _this.onChange("complete", r);
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
})(resource || (resource = {}));
var resource;
(function (resource) {
    var JsonResource = (function () {
        function JsonResource() {
        }
        JsonResource.prototype.preload = function (callback) {
            this.callback = callback;
            var request = new egret.URLRequest(this.realPath);
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
    resource.JsonResource = JsonResource;
    var ImageResource = (function () {
        function ImageResource() {
        }
        ImageResource.prototype.preload = function (callback) {
            var request = new egret.URLRequest(this.realPath);
            var loader = new egret.URLLoader();
            loader.dataFormat = egret.URLLoaderDataFormat.TEXTURE;
            loader.addEventListener(egret.Event.COMPLETE, this.onComplete, this);
            loader.load(request);
            this.callback = callback;
        };
        ImageResource.prototype.onComplete = function (e) {
            var loader = e.target;
            loader.removeEventListener(egret.Event.COMPLETE, this.onComplete, this);
            var texture = loader.data;
            this.data = texture;
            this.callback();
        };
        ImageResource.prototype.load = function (callback) {
        };
        ImageResource.prototype.unload = function () {
        };
        ImageResource.prototype.dispose = function () {
        };
        return ImageResource;
    }());
    resource.ImageResource = ImageResource;
})(resource || (resource = {}));
var ResourceShim = (function (_super) {
    __extends(ResourceShim, _super);
    function ResourceShim() {
        _super.apply(this, arguments);
    }
    return ResourceShim;
}(egret.EventDispatcher));
var shim = new ResourceShim();
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
    function resourceMatcher(path) {
        var result;
        if (path.match(/.json/)) {
            result = new resource.JsonResource();
        }
        else if (path.match(/.jpg/) || path.match(/.png/)) {
            result = new resource.ImageResource();
        }
        result.path = path;
        var realpath;
        if (path.indexOf(resourceRootName) == -1) {
            realpath = resourceRootName + path;
        }
        else {
            realpath = path;
        }
        result.realPath = realpath;
        return result;
    }
    RES.resourceMatcher = resourceMatcher;
    var configFileName;
    var resourceRootName;
    var config;
    function onChange(type, resourceFile) {
        console.log("load " + type + " : " + resourceFile.path);
        if (resourceFile.path == configFileName) {
            var data = resourceFile.data;
            var groups_1 = {};
            var resources_1 = {};
            var resourcemapper = function (resourceConfig) {
                resources_1[resourceConfig.name] = resourceConfig;
                resourceConfig.state = resource.State.UNLOADED;
            };
            data.resources.forEach(resourcemapper);
            var groupmapper = function (group) {
                groups_1[group.name] = group;
                var resourceNames = group.keys.split(",");
                group.resources = resourceNames.map(function (resourceName) { return resources_1[resourceName]; });
            };
            data.groups.forEach(groupmapper);
            config = { resources: resources_1, groups: groups_1 };
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
    function isLoaded(resourceConfig) {
        return resourceConfig.state == resource.State.LOADED;
    }
    function getResourceFromUrl(url) {
        var resources = config.resources;
        for (var key in resources) {
            var resource = resources[key];
            if (resource.url === url) {
                return resource;
            }
        }
        return null;
    }
    function getResourceFromName(name) {
        return config.resources[name];
    }
    function loadConfig(configFile, resourceRoot) {
        configFileName = configFile;
        resourceRootName = resourceRoot;
        resourceManager.onChange = onChange;
        resourceManager.preload(configFile);
    }
    RES.loadConfig = loadConfig;
    function loadGroup(groupName) {
        var group = config.groups[groupName];
        var resourceNames = group.keys.split(",");
        var loadResource = function (resourceName) {
            var resource = config.resources[resourceName];
            if (resource) {
                resourceManager.preload(resource.url);
            }
        };
        if (resourceNames) {
            resourceNames.forEach(loadResource);
        }
        console.log("loadgroup:" + groupName, JSON.stringify(group));
    }
    RES.loadGroup = loadGroup;
    function getRes(resourceName) {
        var config = getResourceFromName(resourceName);
        var resource = resourceManager.readFile(config.url);
        return resource ? resource.data : null;
    }
    RES.getRes = getRes;
    function getResAsync(name, callback, thisObject) {
    }
    RES.getResAsync = getResAsync;
})(RES || (RES = {}));
var resourceManager = new resource.Core();
resourceManager.resourceMatcher = RES.resourceMatcher;
