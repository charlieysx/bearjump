import {stage, screen, monitor, loader} from '../core';

export default {
    show() {
        wx.$store.font = wx.loadFont('static/fonts/zkklt.ttf') || 'sans-serif';
        this.init();
        stage.addChild(this.container);
        monitor.emit('scene:show', 'home');
    },
    hide() {
        this.container.destroy({children: true});
        monitor.emit('scene:hide', 'home');
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
        await Promise.all([this.load(), (async ()=> {
            wx.showLoading();
            const {OPENID} = await wx.$cloud.getWXContext();
            wx.$store.openId = OPENID;
            wx.hideLoading();
        })()]);
        this.container.removeChild(text);
        wx.$store.userInfo = await this.getUserInfo();
        wx.$store.userInfo.openId = wx.$store.openId;
        wx.$open.postMessage('setSelfInfo', JSON.stringify(wx.$store.userInfo));
        this.hide();
        monitor.emit('scene:go', 'home');
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
                                resolve(userInfo);
                            }
                        });
                    }
                }
            });
        });
    }
};
