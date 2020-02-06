import './utils/index';
import './utils/pixiUtil';
import './modules/store';
import './modules/cloud';
import './modules/sound';
import './modules/open';
import { stage, ticker, monitor, screen } from './core';
import { preload, home, game, test } from './scenes';


let pointer = null;

const initRouter = ()=> {
    if(pointer) {
        return;
    }
    monitor
        .on('scene:go', (name, opt = {}) => {
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
    monitor.emit('scene:go', 'preload');
};

wx.onShow(info => {
    monitor.emit('wx:show', info);
    wx.$store.ready && monitor.emit('wx:onAudioInterruptionEnd');
    initRouter();
});

wx.onAudioInterruptionBegin(()=> {
    console.log('onAudioInterruptionBegin');
});

wx.onAudioInterruptionEnd(()=> {
    console.log('onAudioInterruptionEnd');
    monitor.emit('wx:onAudioInterruptionEnd');
});

const setShare = ()=> {
    wx.showShareMenu({withShareTicket: true});
    wx.onShareAppMessage(() => ({
        title: '努力跳得更高...',
        query: `id=${wx.$store.openId}`,
        imageUrl: [
            'http://bearfile.codebear.cn/jump/wxshare.png'
        ][~~(Math.random() * 1)]
    }));
    
    monitor.on('wx:share', opt => {
        if (opt.query) {
            opt.query += `&id=${wx.$store.openId}`;
        }
        wx.shareAppMessage(Object.assign({
            title: '努力跳得更高...',
            query: `id=${wx.$store.openId}`,
            imageUrl: [
                'http://bearfile.codebear.cn/jump/wxshare.png'
            ][~~(Math.random() * 1)]
        }, opt));
    });
};

const listenAudio = ()=> {
    monitor.on('wx:onAudioInterruptionEnd', ()=> {
        // 这里填空的话，会自动获取最后一次播放的音乐
        wx.$audio.playBgm('', true);
    }).on('muted:bgm', (muted)=> {
        wx.$audio.muteBgm(muted);
    }).on('muted:sound', (muted)=> {
        wx.$audio.mute(muted);
    });
};

/**
 * 游戏圈
 */
const createGameCenterButton = async ()=> {
    const button = wx.createGameClubButton({
        icon: 'white',
        style: {
            left: 10,
            top: screen.height * 0.2,
            width: 40,
            height: 40
        }
    });
    
    button.hide();
    
    monitor
        .on('scene:show', name => name === 'home' ? button.show() : button.hide())
        .on('scene:hide', name => name === 'home' && button.hide());
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
listenAudio();
// playBgm();
createGameCenterButton();
