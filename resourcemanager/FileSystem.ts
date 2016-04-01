
interface ResourceConfigMap {


    // resources

    [index: string]: ResourceFile;


}

interface ResourceConfig {


    loadedState: ResourceState;


}

enum ResourceState {

    UNLOADED,

    LOADING,

    LOADED


}


class ResourceManager {

    public onChange: (type, resource: ResourceFile) => void

    private q;

    private config: ResourceConfigMap;

    public exists(): Boolean {
        return true;
    }

    public readFile(path: string): ResourceFile {
        return new ImageResource();
    }

    public writeFile(): void {

    }

    /**
     * temp 
     * */
    public preload(path: string | Array<string>) {


        var testObject = { name: '111' };
        var paths: Array<string> = [];
        if (typeof path === "string") {
            paths = [path];
        }
        else {
            paths = path;
        }
        var tasks = paths.map((p) => {

            var resource = new JsonResource();
            resource.path = p;
            return resource;

        });


        var q = async.priorityQueue<ResourceFile>((task, callback) => {
            console.log('load ' + task.path);
            this.onChange("complete", task);
            callback();
        }, 2);

        this.q = q;


        // assign a callback
        q.drain = function () {
            console.log('all items have been processed');
            // q.push({ name: 'foo1' }, 0, function (err) {
            //     console.log('finished processing foo1');
            //     q.resume();
            // });

        }

        // add some items to the queue

        q.push(tasks, 0, function (err) {
            console.log('finished processing foo');
        });

    }



}





interface ResourceFile {


    path: string;

    data: any;

    preload(callback);

    load(callback);

    unload();

    dispose();

}

class JsonResource implements ResourceFile {

    path: string;

    data: any;

    preload(callback) {
        var request: egret.URLRequest = new egret.URLRequest(this.path);
        var loader: egret.URLLoader = new egret.URLLoader();
        loader.dataFormat = egret.URLLoaderDataFormat.TEXT;
        loader.addEventListener(egret.Event.COMPLETE, this.onComplete, this);
        loader.load(request);
    }

    private onComplete(e: egret.Event) {
        var loader: egret.URLLoader = <egret.URLLoader>e.target;
        loader.removeEventListener(egret.Event.COMPLETE, this.onComplete, this);
        var text = loader.data;
        this.data = JSON.parse(text);
    }


    load(callback) {

    }

    unload() {

    }

    dispose() {

    }



}


class ImageResource implements ResourceFile {

    path: string;

    data: egret.Texture;

    preload(callback) {
        var request: egret.URLRequest = new egret.URLRequest(this.path);
        var loader: egret.URLLoader = new egret.URLLoader();
        loader.dataFormat = egret.URLLoaderDataFormat.TEXTURE;
        loader.addEventListener(egret.Event.COMPLETE, this.onComplete, this);
        loader.load(request);
    }

    private onComplete(e: egret.Event) {
        var loader: egret.URLLoader = <egret.URLLoader>e.target;
        loader.removeEventListener(egret.Event.COMPLETE, this.onComplete, this);
        var texture: egret.Texture = loader.data;
        this.data = texture;

    }


    load(callback) {

    }

    unload() {

    }

    dispose() {

    }

}