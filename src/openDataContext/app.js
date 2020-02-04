wx.onMessage(handle);

function handle({type, data}) {
    if (type === 'upload') {
        upload(data);
    }
}

function upload(score) {
    wx.setUserCloudStorage({
        KVDataList: [{
            key: 'chart',
            value: JSON.stringify({
                wxgame: {
                    score,
                    update_time: Date.now()
                }
            })
        }]
    });
}

