import {EventEmitter} from 'events';

class Sound extends EventEmitter {
    constructor(src, {volume = 1, loop = false, autoDestroy = true, autoplay = false, canplay = ()=> {}}) {
        super();

        this.ctx = wx.createInnerAudioContext();
        this.ctx.loop = loop;
        this.ctx.volume = volume;
        this.ctx.autoplay = true;
        
        this.ctx.onCanplay(()=> {
            this.ctx.offCanplay();
            if (!autoplay) {
                this.stop();
            }
            canplay();
        });
        !loop && autoDestroy && this.ctx.onEnded(() => this.destroy());
        this.ctx.onError(() => this.destroy());

        this.ctx.src = src;
    }

    play() {
        !wx.$store.muted && this.ctx?.play();
    }

    stop() {
        this.ctx?.stop();
    }

    pause() {
        this.ctx?.pause();
    }

    destroy() {
        if (!this.ctx) {
            return;
        }
        this.ctx.destroy();
        this.ctx = null;
    }
}

wx.$sound = {
    mute: (muted)=> {

    },
    load: (src, opt = {autoplay: false})=> {
        return new Sound(src, opt);
    },
    play: (src, opt = {autoplay: true})=> {
        return new Sound(src, opt);
    }
};