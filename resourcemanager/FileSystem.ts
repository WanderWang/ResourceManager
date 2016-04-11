

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

        public preload(path: string, callback?: (r: ResourceFile) => void) {

            var paths: Array<string> = [path];
       
            var tasks = paths.map(this.resourceMatcher);


            var q = async.priorityQueue<ResourceFile>((r: ResourceFile, c) => {
                console.log('load ' + r.path);
                r.preload(() => {
                    this.writeFile(r);
                    if (callback) {
                        callback(r);
                    }
                    this.onChange("complete", r);
                    c();
                })
            }, 2);

            this.q = q;


            // assign a callback
            q.drain = function () {
                console.log('all items have been processed');

            }

            // add some items to the queue

            q.push(tasks, 0, function (err) {
                console.log('finished processing foo');
            });

        }



    }



}


