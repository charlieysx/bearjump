# jump
小熊上山微信小游戏，同款游戏已上线。

这是第一个版本，因为使用colloc相同的脚手架开发，微信审核不通过。
所以重构了一版，重构的就不发出来了，核心游戏代码差不多。

colloc源码地址：https://github.com/JetLua/colloc
感谢作者分享的pixi.js开发微信小游戏。

### 小游戏码
<img src="https://github.com/CB-ysx/bearjump/blob/master/readmeimg/code.jpg" width="33%">

### 配置
> 修改成开发者自己的云开发环境和广告位 ID

- 小程序端
```js
// src/core/env.js
// 云开发 环境名
PIXI.settings.CLOUD_ENV = ''
```
- 云函数
```js
// 每个函数是独立的所以需要开发者自行修改
cloud.init({env: ''})
```

- 广告位
```js
// 开发者自己的广告位 ID
wx.createRewardedVideoAd({
  adUnitId: ''
})
```

### 开发

```bash
# clone 项目
git clone https://github.com/CB-ysx/bearjump.git

# 安装依赖
npm i

# dev 可以替换成 build
# 运行
npm run dev

# 微信开发者工具选择 dist 目录
```

### 游戏截图

<img src="https://github.com/CB-ysx/bearjump/blob/master/readmeimg/1.png" width="33%"><img src="https://github.com/CB-ysx/bearjump/blob/master/readmeimg/2.png" width="33%"><img src="https://github.com/CB-ysx/bearjump/blob/master/readmeimg/3.png" width="33%">

<img src="https://github.com/CB-ysx/bearjump/blob/master/readmeimg/4.png" width="33%"><img src="https://github.com/CB-ysx/bearjump/blob/master/readmeimg/5.png" width="33%"><img src="https://github.com/CB-ysx/bearjump/blob/master/readmeimg/6.png" width="33%">

<img src="https://github.com/CB-ysx/bearjump/blob/master/readmeimg/7.png" width="33%"><img src="https://github.com/CB-ysx/bearjump/blob/master/readmeimg/8.png" width="33%"><img src="https://github.com/CB-ysx/bearjump/blob/master/readmeimg/9.png" width="33%">
