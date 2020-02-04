import './utils/index';
import './utils/pixiUtil';
import './modules/store';
import './modules/cloud';
import './modules/sound';
import { stage, ticker, monitor, screen } from './core';
import { preload, home, game, test } from './scenes';

wx.onShow(info => monitor.emit('wx:show', info));

const setShare = ()=> {
    wx.showShareMenu({withShareTicket: true});
    wx.onShareAppMessage(() => ({
        title: '努力跳得更高...',
        query: `id=${wx.$store.openId}`,
        imageUrl: [
            'http://blogimg.codebear.cn/share.png'
        ][~~(Math.random() * 1)]
    }));
    
    monitor.on('wx:share', opt => {
        wx.shareAppMessage(opt || {
            title: '努力跳得更高...',
            query: `id=${wx.$store.openId}`,
            imageUrl: [
                'http://blogimg.codebear.cn/share.png'
            ][~~(Math.random() * 1)]
        });
    });
};

const initRouter = ()=> {
    let pointer = null;
    monitor
        .on('wx:show', async ({query: {scene}}) => {
            !pointer && monitor.emit('scene:go', 'preload');
        })
        .on('scene:go', (name, opt) => {
            switch (name) {
            case 'preload': {
                pointer = preload;
                preload.show(opt);
                break;
            }
            case 'home': {
                pointer = home;
                home.show(opt);
                break;
            }
            case 'game': {
                pointer = game;
                game.show(opt);
                break;
            }
            }
        });
};


const playBgm = ()=> {
    wx.$sound.fail = wx.$sound.load(
        'static/sounds/fail.mp3',
        { volume: .5, autoDestroy: false }
    );
    wx.$sound.tap = wx.$sound.load(
        'static/sounds/jump.mp3',
        { volume: .5, autoDestroy: false }
    );
    wx.$sound.score = wx.$sound.load(
        'static/sounds/score.mp3',
        { volume: .5, autoDestroy: false }
    );
    const bgm = wx.$sound.load(
        'http://bearfile.codebear.cn/jump/bgm.mp3',
        { volume: .5, loop: true }
    );
    
    bgm.play();
    monitor.on('wx:show', async () => {
        !wx.$store.mute && bgm.play();
    });
    wx.onAudioInterruptionEnd(()=> {
        !wx.$store.mute && bgm.play();
    });
};

/**
 * 游戏圈
 */
const createGameCenterButton = ()=> {
    // const button = wx.createGameClubButton({
    //     icon: 'white',
    //     style: {
    //         left: 10,
    //         top: screen.height * .2,
    //         width: 40,
    //         height: 40
    //     }
    // });
    
    // button.hide();
    
    // monitor
    //     .on('scene:show', name => name === 'home' ? button.show() : button.hide())
    //     .on('scene:hide', name => name === 'home' && button.hide());
};

/**
 * 检查更新
 */
const checkUpdate = ()=> {
    const manager = wx.getUpdateManager();
    manager.onUpdateReady(() => {
        manager.applyUpdate();
    });
};

checkUpdate();
setShare();
initRouter();
playBgm();
createGameCenterButton();
