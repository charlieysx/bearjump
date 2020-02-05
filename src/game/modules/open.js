import { screen } from '../core';

const context = wx.getOpenDataContext();

class WxOpen {

    postMessage(type, data) {
        context.postMessage({type, data});
    }
    
    getCanvas() {
        return context.canvas;
    }
    
    showEnd(score) {
        this.postMessage('showEndScore', +score);
    }
}

wx.$open = new WxOpen();