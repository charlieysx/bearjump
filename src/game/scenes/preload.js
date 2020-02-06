import {stage, screen, monitor, loader} from '../core';

export default {
    show() {
        wx.$store.font = wx.loadFont('static/fonts/zkklt.ttf') || 'sans-serif';
        this.init();
        stage.addChild(this.container);
        monitor.emit('scene:show', 'preload');
    },
    hide() {
        this.container.destroy({children: true});
        monitor.emit('scene:hide', 'preload');
    },
    load() {
        return new Promise((resolve, reject)=> {
            loader.load(()=> {
                resolve();
            });
        });
    },
    async init() {
        this.container = new PIXI.Container();
        this.container.interactive = true;

        let text = new PIXI.Text('0%', {
            fontFamily: wx.$store.font,
            fontSize: 36,
            fill: "black",
            stroke: '#ff3300'
        });
        text.anchor.set(0.5, 0.5);
        text.x = screen.width / 2;
        text.y = screen.height / 2;

        loader.onProgress.add(e=> {
            text.text = `${~~(e.progress)}%`;
        });
        loader.add('bg', 'static/textures/bg.png');
        await this.load();
        const bg = pixiUitl.genSprite('bg');
        bg.width = screen.width;
        bg.height = screen.height;
        this.container.addChild(bg);
        this.container.addChild(text);

        Object.entries(pixiUitl.imgList).forEach(([k, v])=> loader.add(k, v));
        wx.showLoading();
        await Promise.all([
            this.load(),
            (async ()=> {
                const {OPENID} = await wx.$cloud.getWXContext();
                wx.$store.openId = OPENID;
            })(),
            Promise.all([{key: 'bgm', src: 'http://bearfile.codebear.cn/jump/bgm2.mp3'}].map(async item=> {
                await wx.$audio.loadBgm(item.key, item.src);
            })),
            Promise.all([
                {key: 'coutdown', src: 'static/sounds/coutdown.mp3'},
                {key: 'coutdown_end', src: 'static/sounds/coutdown_end.mp3'},
                {key: 'tap', src: 'static/sounds/jump.mp3'},
                {key: 'score', src: 'static/sounds/score.mp3'},
                {key: 'shielding', src: 'static/sounds/shielding.mp3'},
                {key: 'fail', src: 'static/sounds/fail.mp3'}
            ].map(async item=> {
                await wx.$audio.load(item.key, item.src);
            }))
        ]);
        this.container.removeChild(text);
        const info = await this.getUserInfo();
        wx.hideLoading();
        if (!info) {
            let button = wx.createUserInfoButton({
                type: 'image',
                image: 'static/textures/open.png',
                style: {
                    left: (screen.width - 96) / 4,
                    top: (screen.height - 52) / 4,
                    width: 96 / 2,
                    height: 52 / 2,
                },
                lang: 'zh_CN'
            });
            button.onTap(({userInfo}) => {
                if (userInfo) {
                    button.destroy();
                    wx.$store.userInfo = userInfo;
                    this.next();
                }
            });
        } else {
            wx.$store.userInfo = info;
            this.next();
        }
    },
    async getUserInfo() {
        return new Promise(resolve=> {
            wx.getSetting({
                success: (res)=> {
                    if (res.authSetting['scope.userInfo']) {
                        wx.getUserInfo({
                            success: ({userInfo})=> {
                                resolve(userInfo);
                            }
                        });
                    } else {
                        resolve(null);
                    }
                }
            });
        });
    },
    next() {
        wx.$store.ready = true;
        wx.$audio.playBgm('bgm');
        wx.$store.userInfo.openId = wx.$store.openId;
        wx.$open.postMessage('setSelfInfo', JSON.stringify(wx.$store.userInfo));
        this.hide();
        monitor.emit('scene:go', 'home');
    }
};
