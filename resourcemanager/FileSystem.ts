

module resource {


    interface ResourceConfigMap {


        // resources

        [index: string]: ResourceFile;


    }

    interface ResourceConfig {


        loadedState: State;


    }

    export enum State {

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



}


