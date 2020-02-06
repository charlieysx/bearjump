class AudioManager {
    constructor() {
        this.audioList = new Map();
        this.playingList = new Map();

        this.bgmList = new Map();
        this.playingBgm = {
            lastKey: '',
            key: '',
            ctx: null
        };

        this.muted = {
            bgm: localStorage.getItem('muted:bgm'),
            sound: localStorage.getItem('muted:sound')
        };
    }

    async load(key, src) {
        return new Promise((resolve)=> {
            const ctx = wx.createInnerAudioContext();
            ctx.onCanplay(()=> {
                ctx.offCanplay();
                this.audioList.set(key, {
                    src,
                    ctx
                });
                resolve();
            });
            ctx.src = src;
        });
    }

    async loadBgm(key, src) {
        return new Promise((resolve)=> {
            const ctx = wx.createInnerAudioContext();
            ctx.loop = true;
            ctx.onCanplay(()=> {
                ctx.offCanplay();
                this.bgmList.set(key, {
                    src,
                    ctx
                });
                resolve();
            });
            ctx.src = src;
        });
    }

    playBgm(key) {
        key = key || this.playingBgm.key || this.playingBgm.lastKey;
        const bgm = this.bgmList.get(key);
        if (bgm) {
            if (this.playingBgm.key === key) {
                return;
            }
            if (this.playingBgm.ctx !== null) {
                this.playingBgm.ctx.stop();
                this.playingBgm.ctx = null;
            }
            this.playingBgm.lastKey = this.playingBgm.key || key;
            if (this.muted.bgm) {
                return;
            }
            this.playingBgm.key = key;
            this.playingBgm.ctx = bgm.ctx;
            this.playingBgm.ctx.play();
        }
    }

    volumeBgm(num) {
        if (this.playingBgm.ctx !== null) {
            this.playingBgm.ctx.volume = num;
        }
    }

    muteBgm(muted) {
        this.muted.bgm = muted;
        localStorage.setItem('muted:bgm', muted);
        if (muted) {
            if (this.playingBgm.ctx !== null) {
                this.playingBgm.lastKey = this.playingBgm.key;
                this.playingBgm.key = '';
                this.playingBgm.ctx.stop();
                this.playingBgm.ctx = null;
            }
        } else {
            if (this.playingBgm.lastKey) {
                this.playBgm(this.playingBgm.lastKey);
            } else {
                console.log('还未播放过背景音乐');
            }
        }
    }

    play(key, {
        force = false // 强制播放，会重新播放
    } = {}) {
        let audio = this.playingList.get(key);
        if (audio) {
            if (!force) {
                return;
            }
            audio.ctx.stop();
        }
        if (!audio) {
            audio = this.audioList.get(key);
        }
        if (!audio) {
            console.log('不存在音效', key);
            return;
        }
        if (this.muted.sound) {
            return;
        }
        audio.ctx.offStop();
        audio.ctx.offEnded();
        audio.ctx.onStop(()=> {
            this.playingList.delete(key);
        });
        audio.ctx.onEnded(()=> {
            this.playingList.delete(key);
        });
        this.playingList.set(key, audio);
        audio.ctx.play();
    }

    volume(num) {
        if (this.playingBgm.ctx !== null) {
            this.playingBgm.ctx.volume = num;
        }
    }

    mute(muted) {
        this.muted.sound = muted;
        localStorage.setItem('muted:sound', muted);
        if (muted) {
            for (let [key, value] of this.playingList) {
                value.ctx.stop();
            }
        }
    }
}

wx.$audio = new AudioManager();