

module resource {


    interface FileSystemMap {


        // resources

        [index: string]: ResourceFile;


    }

    // interface ResourceConfig {


    //     loadedState: State;


    // }

    export enum State {

        UNLOADED,

        LOADING,

        LOADED


    }



    export class Core {

        public onChange: (type, resource: ResourceFile) => void


        public resourceMatcher: (url) => ResourceFile;

        private q;

        private fs: FileSystemMap = {};

        public exists(): Boolean {
            return true;
        }

        public readFile(path: string): ResourceFile {
            return this.fs[path];
        }

        public writeFile(r: ResourceFile): void {
            this.fs[r.path] = r;
        }

        public preload(path: string | Array<string>) {

            var paths: Array<string> = [];
            if (typeof path === "string") {
                paths = [path];
            }
            else {
                paths = path;
            }
            var tasks = paths.map(this.resourceMatcher);


            var q = async.priorityQueue<ResourceFile>((r: ResourceFile, callback) => {
                console.log('load ' + r.path);
                r.preload(() => {
                    this.writeFile(r);
                    this.onChange("complete", r);
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


