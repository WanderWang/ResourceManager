

module resource {




    /**
     * 文件系统，key 为文件的虚拟路径，value 为一个 Resource 对象
     */
    interface FileSystemMap {


        // resources

        [index: string]: AbstructResource;


    }

    export enum State {

        UNLOADED,

        LOADING,

        LOADED


    }



    export class Core {

        public onChange: (type, resource: AbstructResource) => void


        public resourceMatcher: (url) => AbstructResource;

        private q;

        private fs: FileSystemMap = {};

        public exists(): Boolean {
            return true;
        }

        public readFile(path: string): AbstructResource {
            return this.fs[path];
        }

        public writeFile(r: AbstructResource): void {
            this.fs[r.path] = r;
        }
        
        public deleteFile(path:string):void{
            var file = this.readFile(path);
            if (file){
                file.dispose();
                delete this.fs[path];
            }
        }

        public preload(path: string, priority:number = 0,callback?: (r: AbstructResource) => void) {

            var paths: Array<string> = [path];
       
            var tasks = paths.map(this.resourceMatcher);


            var q = async.priorityQueue<AbstructResource>((r: AbstructResource, c) => {
                console.log('load ' + r.path);
                r.preload(() => {
                    console.log ('load complete : ' + r.path)
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

            q.push(tasks, priority, function (err) {
                console.log('finished processing foo');
            });

        }



    }



}


