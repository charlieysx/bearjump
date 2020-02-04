wx.cloud.init({env: PIXI.settings.CLOUD_ENV});

function getWXContext() {
    return wx.cloud.callFunction({ name: 'getWXContext' });
}

wx.$cloud = {
    getWXContext
};