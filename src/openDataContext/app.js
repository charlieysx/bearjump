const sharedCanvas = wx.getSharedCanvas();
const sharedCtx = sharedCanvas.getContext('2d');

const cacheCanvas = wx.createCanvas();
const cacheCtx = cacheCanvas.getContext('2d');

const {
    devicePixelRatio,
    windowWidth: width,
    windowHeight: height,
} = wx.getSystemInfoSync();

const pixelRatio = Math.min(2, devicePixelRatio);
const canvasWidth = width * devicePixelRatio;
const canvasHeight = height * devicePixelRatio;

let selfInfo = {};

wx.onMessage(handle);

function handle({type, data}) {
    switch(type) {
    case 'setSelfInfo':
        selfInfo = JSON.parse(data || '{}');
        break;
    case 'showFriendRank':
        showFriendRank();
        break;
    case 'updateMaxScore':
        updateMaxScore();
        break;
    case 'showEndScore':
        showEndScore(data);
        break;
    }
}

function showFriendRank() {
    wx.getFriendCloudStorage({
        keyList: ['score'],
        success: (res)=> {
            console.log(res);
            // itemCanvas.width = 100;
            // itemCanvas.height = 100;
            // ctx.fillStyle = '#00ff00';
            // ctx.fillRect(0, 0, 100, 100);
        }
    });
}

const endWidth = 500 * 2;
const endHeight = 540 * 2;

function drawToShared() {
    sharedCtx.drawImage(cacheCanvas, 0, 0, sharedCanvas.width, sharedCanvas.height);
}

function showEndScore(score) {
    sharedCtx.clearRect(0, 0, sharedCanvas.width, sharedCanvas.height);

    cacheCtx.clearRect(0, 0, endWidth, endHeight);
    cacheCanvas.width = endWidth;
    cacheCanvas.height = endHeight;
    // 白色背景
    cacheCtx.fillStyle = '#ffffff';
    cacheCtx.fillRect(0, 0, endWidth, endHeight);
    cacheCtx.fillStyle = '#a68152';
    cacheCtx.fillRect(0, 0, endWidth, 97 * 2);
    cacheCtx.fillStyle = '#ffffff';
    cacheCtx.font = 'bold 72px sans-serif';
    cacheCtx.textAlign = 'center';
    cacheCtx.textBaseline = 'middle';
    cacheCtx.fillText('本次得分', endWidth / 2, 97);

    cacheCtx.fillStyle = '#000000';
    cacheCtx.font = 'bold 136px sans-serif';
    cacheCtx.textBaseline = 'top';
    cacheCtx.fillText(score, endWidth / 2, 97 * 2 + 30);

    cacheCtx.strokeStyle = '#666666';
    cacheCtx.lineWidth = 2;
    cacheCtx.beginPath();
    cacheCtx.moveTo(100, 97 * 2 + 30 + 128 + 140);
    cacheCtx.lineTo(endWidth - 100, 97 * 2 + 30 + 128 + 140);
    cacheCtx.closePath();
    cacheCtx.stroke();
    drawToShared();

    function getFriendCloudStorage() {
        wx.getFriendCloudStorage({
            keyList: ['score'],
            success: ({data})=> {
                const sortList = sort({list: data});
                const list = [];
                const index = sortList.findIndex(item=> item.openid === selfInfo.openId);
                let start = index;
                // 前面还有，下标往前移动
                if (index > 0) {
                    start--;
                }
                // 是最后一个，下标继续往前移动
                if (index === sortList.length - 1) {
                    start--;
                }
                // 下标至少为0
                start = Math.max(0, start);
                for (let i = start;i < start + 3;++i) {
                    const item = sortList[i];
                    if (item) {
                        const newItem = {...item};
                        newItem.rank = i + 1;
                        list.push(newItem);
                    }
                }

                drawRank(list);
            }
        });
    }

    function drawRank(list) {
        const top = 600;
        const start = (endWidth - list.length * 200 - (list.length - 1) * 100) / 2;
        // 先绘制头像
        list.forEach((item, index)=> {
            const avatarCenter = start + 200 * index + 100 * index + 100;
            const avatar = wx.createImage();
            avatar.src = item.avatarUrl;
            avatar.onload = ()=> {
                cacheCtx.save();
                cacheCtx.beginPath();
                cacheCtx.arc(avatarCenter, top + 100, 100, 0, 2 * Math.PI);
                cacheCtx.closePath();
                cacheCtx.clip();
                cacheCtx.drawImage(avatar, avatarCenter - 100, top, 200, 200);
                cacheCtx.restore();
                cacheCtx.strokeStyle = '#a68152';
                cacheCtx.lineWidth = 10;
                cacheCtx.fillStyle = '#ffffff';
                const x = avatarCenter - 100;
                const y = top - 30;
                const w = 200;
                const h = 80;
                const br = h / 2;
                cacheCtx.save();
                cacheCtx.beginPath();
                cacheCtx.moveTo(x + br, y);
                cacheCtx.lineTo(x + w - br, y);
                cacheCtx.arc(x + w - br, y + br, br, 2 * Math.PI * (3 / 4), 2 * Math.PI * (4 / 4));
                cacheCtx.lineTo(x + w, y + h - br);
                cacheCtx.arc(x + w - br, y + h - br, br, 0, 2 * Math.PI * (1 / 4));
                cacheCtx.lineTo(x + br, y + h);
                cacheCtx.arc(x + br, y + h - br, br, 2 * Math.PI * (1 / 4), 2 * Math.PI * (2 / 4));
                cacheCtx.lineTo(x, y + br);
                cacheCtx.arc(x + br, y + br, br, 2 * Math.PI * (2 / 4), 2 * Math.PI * (3 / 4));
                cacheCtx.closePath();
                cacheCtx.clip();
                cacheCtx.fillRect(x, y, w, h);
                cacheCtx.stroke();
                cacheCtx.restore();

                cacheCtx.fillStyle = '#a68152';
                cacheCtx.font = 'bold 32px sans-serif';
                cacheCtx.textAlign = 'center';
                cacheCtx.textBaseline = 'middle';
                cacheCtx.fillText(`第${item.rank}名`, avatarCenter, y + h / 2);
                drawToShared();
            };
            
            cacheCtx.fillStyle = '#999999';
            cacheCtx.font = 'normal 36px sans-serif';
            cacheCtx.textAlign = 'center';
            cacheCtx.textBaseline = 'top';
            cacheCtx.fillText(item.nickname, avatarCenter, top + 200 + 30);
            
            cacheCtx.fillStyle = '#000000';
            cacheCtx.font = 'normal 48px sans-serif';
            cacheCtx.textAlign = 'center';
            cacheCtx.textBaseline = 'top';
            cacheCtx.fillText(item.score, avatarCenter, top + 200 + 30 + 36 + 60);
        });
        drawToShared();
    }

    wx.getUserCloudStorage({
        keyList: ['score'],
        success: (data)=> {
            if (!data || !data.KVDataList) {
                return;
            }
            const hadScore = (+(data.KVDataList[0]?.value) || -1) > -1;
            const lastScore = (+(data.KVDataList[0]?.value) || score);

            // 绘制历史最高得分
            cacheCtx.fillStyle = '#999999';
            cacheCtx.font = 'bold 48px sans-serif';
            cacheCtx.textBaseline = 'top';
            cacheCtx.fillText(`历史最高得分：${Math.max(lastScore, score)}`, endWidth / 2, 97 * 2 + 30 + 136 + 40);

            // 没有玩过或新纪录，更新成绩
            if (!hadScore || lastScore < score) {
                // 绘制新纪录提示
                cacheCtx.fillStyle = '#ff0000';
                cacheCtx.font = 'bold 36px sans-serif';
                cacheCtx.textAlign = 'right';
                cacheCtx.textBaseline = 'top';
                cacheCtx.fillText('新纪录', endWidth - 100, 97 * 2 + 30);
                
                wx.setUserCloudStorage({
                    KVDataList: [{ key: 'score', value: `${score}` }],
                    success: getFriendCloudStorage
                });
            } else {
                getFriendCloudStorage();
            }

            drawToShared();
        }
    });
}

function sort({list, key = 'KVDataList', subKey = 'score', desc = -1}) {
    return list.map(item=> {
        item[subKey] = +item[key][0]['value'];
        return item;
    }).sort((a, b)=> {
        return (a[subKey] - b[subKey]) * desc;
    });
}

function updateMaxScore() {
    wx.getUserCloudStorage({
        keyList: ['score'],
        success: (res)=> {
            console.log(res);
            let itemCanvas = wx.getSharedCanvas();
            let ctx = itemCanvas.getContext('2d');
            itemCanvas.width = 100;
            itemCanvas.height = 100;
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(0, 0, 100, 100);
        }
    });
}