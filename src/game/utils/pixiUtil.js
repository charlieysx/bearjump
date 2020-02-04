import {loader} from '../core';
const pixiUitl = {};

pixiUitl.imgList = {
    'open': 'static/textures/open.png',
    'logo': 'static/textures/logo.png',
    'start': 'static/textures/start.png',
    'barrier': 'static/textures/barrier.png',
    'guide': 'static/textures/guide.png',
    'block': 'static/textures/block.png',
    'score': 'static/textures/score.png',
    'bear': 'static/textures/bear.png',
    'star': 'static/textures/star.png'
};

pixiUitl.getTexture = (name)=> {
    return loader.resources[name].texture;
};

pixiUitl.genSprite = (name)=> {
    return new PIXI.Sprite(pixiUitl.getTexture(name));
};

window.pixiUitl = pixiUitl;