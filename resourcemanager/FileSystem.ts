

module resource {


    interface ResourceConfigMap {


        // resources

        [index: string]: ResourceFile;


    }

    interface ResourceConfig {


        loadedState: ResourceState;


    }

    export enum ResourceState {

        UNLOADED,

        LOADING,

        LOADED


    }



    export class Core {

        public onChange: (type, resource: ResourceFile) => void


        public resourceMatcher: (url) => ResourceFile;

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

        public preload(path: string | Array<string>) {

            var paths: Array<string> = [];
            if (typeof path === "string") {
                paths = [path];
            }
            else {
                paths = path;
            }
            var tasks = paths.map((p) => {
                var resource = this.resourceMatcher(p);
                resource.path = p;
                return resource;

            });


            var q = async.priorityQueue<ResourceFile>((task: ResourceFile, callback) => {
                console.log('load ' + task.path);
                task.preload(() => {
                    this.onChange("complete", task);
                    callback();
                })
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





    export interface ResourceFile {


        path: string;

        data: any;

        preload(callback);

        load(callback);

        unload();

        dispose();

    }

    export class JsonResource implements ResourceFile {

        path: string;

        data: any;

        callback: Function;

        preload(callback) {
            this.callback = callback;
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
            this.callback();
        }


        load(callback) {

        }

        unload() {

        }

        dispose() {

        }



    }

    export class ImageResource implements ResourceFile {

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


}


