



module resource {

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
        
        callback:Function;

        preload(callback) {
            var request: egret.URLRequest = new egret.URLRequest(this.path);
            var loader: egret.URLLoader = new egret.URLLoader();
            loader.dataFormat = egret.URLLoaderDataFormat.TEXTURE;
            loader.addEventListener(egret.Event.COMPLETE, this.onComplete, this);
            loader.load(request);
            this.callback = callback;
        }

        private onComplete(e: egret.Event) {
            var loader: egret.URLLoader = <egret.URLLoader>e.target;
            loader.removeEventListener(egret.Event.COMPLETE, this.onComplete, this);
            var texture: egret.Texture = loader.data;
            this.data = texture;
            this.callback();

        }


        load(callback) {

        }

        unload() {

        }

        dispose() {

        }

    }

}