import {loader, screen} from '../core';
const pixiUitl = {};

pixiUitl.imgList = {
    'open': 'static/textures/open.png',
    'logo': 'static/textures/logo.png',
    'start': 'static/textures/start.png',
    'barrier': 'static/textures/barrier.png',
    'guide': 'static/textures/guide.png',
    'block': 'static/textures/block.png',
    'fake_block': 'static/textures/fake_block.png',
    'score': 'static/textures/score.png',
    'bear': 'static/textures/bear.png',
    'bear_shielding': 'static/textures/bear_shielding.png',
    'star': 'static/textures/star.png',
    'mask': 'static/textures/mask.png',
    'btn_home': 'static/textures/btn_home.png',
    'btn_replay': 'static/textures/btn_replay.png',
    'btn_share': 'static/textures/btn_share.png',
    'coutdown1': 'static/textures/coutdown1.png',
    'coutdown2': 'static/textures/coutdown2.png',
    'coutdown3': 'static/textures/coutdown3.png',
    'btn_music': 'static/textures/btn_music.png',
    'btn_music_close': 'static/textures/btn_music_close.png'
};

pixiUitl.getTexture = (name)=> {
    return loader.resources[name].texture;
};

pixiUitl.genSprite = (name)=> {
    return new PIXI.Sprite(pixiUitl.getTexture(name));
};

pixiUitl.genMask = (width = screen.width, height = screen.height)=> {
    let mask = pixiUitl.genSprite('mask');
    mask.width = width;
    mask.height = height;
    mask.alpha = 0.7;
    return mask;
};

window.pixiUitl = pixiUitl;