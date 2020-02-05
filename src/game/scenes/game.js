import {stage, screen, monitor, ticker} from '../core';
import {tween, easing} from 'popmotion';

let touchId = null;

const lineData = [1, 2, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4];

/**
 * 道具类型
 */
const TOOL_TYPE = {
    SCORE: { // 加分数
        id: 0,
        bg: 'score',
        data: 10
    },
    SHIELDING: { // 保护罩
        id: 1,
        bg: 'shielding',
        time: 5000
    }
};

/**
 * 方块类型
 */
const BLOCK_TYPE = {
    EMPTY: 0, // 空
    BARRIER: 1, // 障碍物
    TOOL: 2, // 道具
    FAKE: 3 // 假方块
};

/**
 * 正常的方块
 */
class Block {
    constructor(bg) {
        this.uid = wx.$util.uuid();
        this.type = BLOCK_TYPE.EMPTY;
        this.sw = 0;
        this.sh = 0;
        this._scale = 1;
        this.container = new PIXI.Container();

        this.bg = pixiUitl.genSprite(bg);
        this.sw = this.bg.width;
        this.sh = this.bg.height;
        this.container.addChild(this.bg);
        this.container.width = this.sw;
        this.container.height = this.sh;
    }

    init() {

    }

    startToFall() {

    }

    get alpha() {
        return this.container.alpha;
    }

    get width() {
        return this.container.width;
    }

    get height() {
        return this.container.height;
    }

    get x() {
        return this.container.x;
    }

    get y() {
        return this.container.y;
    }

    set alpha(num) {
        this.container.alpha = num;
    }

    set x(num) {
        this.container.x = num;
    }

    set y(num) {
        this.container.y = num;
    }

    changeWidth(num) {
        if (num === this.container.width) {
            return;
        }
        this._scale = num / this.container.width;
        this.container.width = num;
        this.container.height *= this._scale;
    }

    changeHeight(num) {
        if (num === this.container.height) {
            return;
        }
        this._scale = num / this.container.height;
        this.container.height = num;
        this.container.width *= this._scale;
    }

    set width(num) {
        this.changeWidth(num);
    }

    set height(num) {
        this.changeHeight(num);
    }
}

/**
 * 障碍物
 */
class BarrireBlock extends Block {
    constructor(bg) {
        super(bg);
        this.type = BLOCK_TYPE.BARRIER;
        this.barrier = new PIXI.Sprite();
        this.barrier.anchor.set(0.5, 0.5);
        this.barrier.x = this.container.width / 2;
        this.barrier.y = 18;
        this.container.addChild(this.barrier);
    }

    setBarrier(name) {
        this.barrier.texture = pixiUitl.getTexture(name);
        return this;
    }

    hideBarrier() {
        this.barrier.texture = null;
    }
}

/**
 * 道具
 */
class ToolBlock extends Block {
    constructor(bg) {
        super(bg);
        this.type = BLOCK_TYPE.TOOL;
        this.tool = new PIXI.Sprite();
        this.tool.anchor.set(0.5, 0.5);
        this.tool.x = this.container.width / 2;
        this.tool.y = 18;
        this.container.addChild(this.tool);
        this.tag = '';
        this.toolType = null;
    }

    setToolType(toolType) {
        this.toolType = toolType;
        this.tool.texture = pixiUitl.getTexture(toolType.bg);
        return this;
    }

    use() {
        tween({
            from: 1,
            to: 0,
            duration: 200
        }).start({
            update: v=> {
                this.tool.alpha = v;
            },
            complete: ()=> {
                this.tool.texture = null;
                this.tool.alpha = 1;
            }
        });
    }
}

/**
 * 假的方块（踩上去0.5秒后就会掉落）
 */
class FakeBlock extends Block {
    constructor(bg) {
        super(bg);
        this.type = BLOCK_TYPE.FAKE;
        this.waitToFall = false;
    }

    init() {
        this.waitToFall = false;
    }

    startToFall() {
        this.waitToFall = false;
    }

    fall() {
        return new Promise(resolve=> {
            if (this.waitToFall) {
                tween({
                    from: {
                        y: this.y,
                        alpha: 1
                    },
                    to: {
                        y: screen.height,
                        alpha: 0
                    },
                    ease: easing.easeIn,
                    duration: 200,
                }).start({
                    update: v => {
                        this.y = v.y;
                        this.alpha = v.alpha;
                    },
                    complete: resolve
                });
            } else {
                resolve();
            }
        });
    }
}

class Line {
    constructor(top = 0) {
        this.blockList = [];
        this.top = top;
    }

    getBlock(i) {
        return this.blockList[i];
    }

    get length() {
        return this.blockList.length;
    }

    setTop(top) {
        this.top = top;
    }

    push(block) {
        this.blockList.push(block);
    }

    pushList(blockList) {
        this.blockList.push(...blockList);
    }

    animTop() {
        this.blockList.forEach(block=> {
            tween({
                from: {
                    y: block.y
                },
                to: {
                    y: this.top
                },
                ease: easing.easeIn,
                duration: 200,
            }).start(v => {
                block.y = v.y;
            });
        });
    }

    async show(delay = 0, duration = 50) {
        if (this.blockList.length === 0) {
            return;
        }
        const flag = this.blockList.length % 2;
        const start = -(this.blockList.length - flag) / 2 * this.blockList[0].width - this.blockList[0].width * flag / 2 + screen.width / 2;
        this.blockList.forEach((block, index)=> {
            block.y = this.top;
            block.x = start + block.width * index;
        });
        await wx.$util.delay(delay);
        return Promise.all(this.blockList.map((block, index)=> {
            return new Promise(async resolve=> {
                await wx.$util.delay(index * 10);
                tween({
                    from: 0,
                    to: 1,
                    ease: easing.easeIn,
                    duration: duration,
                }).start({
                    update: v => {
                        block.alpha = v;
                    },
                    complete: resolve
                });
            });
        }));
    }
}

class Pool {
    constructor() {
        this.blockList = {};
        Object.entries(BLOCK_TYPE)
            .forEach(([k, v])=> {
                this.blockList[v] = [];
            });
    }

    getBlock(type, bg = 'block') {
        const list = this.blockList[type];
        if (list.length === 0) {
            switch(type) {
            case BLOCK_TYPE.EMPTY:
                return new Block(bg);
            case BLOCK_TYPE.BARRIER:
                return new BarrireBlock(bg);
            case BLOCK_TYPE.TOOL:
                return new ToolBlock(bg);
            case BLOCK_TYPE.FAKE:
                return new FakeBlock('fake_block');
            default:
                return null;
            }
        } else {
            return list.shift();
        }
    }

    recycle(block) {
        block.init();
        this.blockList[block.type].push(block);
    }
}

class Bear {
    constructor() {
        this.container = new PIXI.Container();
        this.bearY = 0;
        this.onUid = -1;
        this.bear = pixiUitl.genSprite('bear');
        this.shielding = pixiUitl.genSprite('bear_shielding');
        this.shielding.anchor.set(0.5, 0.5);
        this.container.addChild(this.bear);
        this.timeoutId = null;
        this.tweenTimeoutId = null;
        this.tweenAction = null;
        this.invincible = false;
    }

    get pivot() {
        return this.container.pivot;
    }

    get skew() {
        return this.container.skew;
    }

    get x() {
        return this.container.x;
    }

    get y() {
        return this.container.y;
    }

    set x(num) {
        this.container.x = num;
    }

    set y(num) {
        this.container.y = num;
    }

    get width() {
        return this.bear.width;
    }

    get height() {
        return this.bear.height;
    }

    set width(num) {
        this.bear.width = num;
        this.container.width = num;
    }

    set height(num) {
        this.bear.height = num;
        this.container.height = num;
    }

    showShielding(time) {
        this.invincible = true;
        clearTimeout(this.timeoutId);
        clearTimeout(this.tweenTimeoutId);
        this.tweenAction && this.tweenAction.stop();
        this.tweenAction = null;
        this.timeoutId = null;
        this.shielding.alpha = 1;
        if (!this.shielding.parent) {
            this.shielding.width = this.bear.width + 30;
            this.shielding.height = this.bear.height + 30;
            this.shielding.x = this.container.width / 2;
            this.shielding.y = this.container.height / 2;
            this.container.addChild(this.shielding);
        }
        this.timeoutId = setTimeout(()=> {
            this.timeoutId = null;
            this.invincible = false;
            this.container.removeChild(this.shielding);
        }, time);
        // 剩下一秒闪烁提示
        this.tweenTimeoutId = setTimeout(()=> {
            this.tweenAction = tween({
                from: 1,
                to: 0,
                ease: easing.easeIn,
                duration: 100,
                yoyo: Infinity
            }).start(v=> {
                this.shielding.alpha = v;
            });
        }, Math.max(0, time - 1000));
    }
}

const blockPool = new Pool();
let tplBlock = null;

export default {
    show(opt) {
        this.guiding = opt && opt.guide;
        this.init();
        monitor.emit('scene:show', 'home');
    },
    hide() {
        this.removeAll();
        monitor.emit('scene:hide', 'home');
    },
    removeAll() {
        this.showEnding = false;
        ticker.remove(this.update, this);
        while(this.lineList.length) {
            const line = this.lineList.pop();
            line.blockList.forEach(block=> {
                this.container.removeChild(block);
                blockPool.recycle(block);
            });
        }
        this.container.destroy();
    },
    init() {
        this.guideStep = 0;
        this.guideCache = {};
        this.starting = false;
        this.startShowEnd = false;
        this.showEnding = false;
        this.lockTouch = false;
        this.isOver = false;
        this.lineList = [];
        this.lineNum = 0;
        this.linePos = 0;
        this.lastLineNum = 0;
        this.score = 0;
        this.finishScore = 0;
        // 游戏结束时用来显示成绩
        this.endSprite = new PIXI.Sprite();
        this.endSprite.width = screen.width * 0.7;
        this.endSprite.height = this.endSprite.width * (540 / 500);
        this.endSprite.x = (screen.width - this.endSprite.width) / 2;
        this.endSprite.y = screen.height / 2 - this.endSprite.height / 2 - 200;

        // 作为方块模板，用于获取每个方块宽度高度等数据
        tplBlock = blockPool.getBlock(BLOCK_TYPE.EMPTY);
        tplBlock.width = screen.width / 5;

        this.bear = new Bear();
        this.bear.width *= tplBlock._scale;
        this.bear.height *= tplBlock._scale;
        this.bear.pivot.set(this.bear.width * 0.5, this.bear.height * 0.8);

        this.container = new PIXI.Container();
        stage.addChild(this.container);
        this.container.interactive = true;

        const bg = pixiUitl.genSprite('bg');
        bg.width = screen.width;
        bg.height = screen.height;
        this.container.addChild(bg);

        this.initBlock();

        this.scoreText = new PIXI.Text('0', {
            fontFamily: wx.$store.font,
            fontSize: 64,
            fill: "white",
            stroke: 'white'
        });
        this.scoreText.x = screen.width / 2;
        this.scoreText.y = 150;
        this.scoreText.anchor.set(0.5, 0.5);
        this.container.addChild(this.scoreText);

        !this.guiding && this.listenTouch();
        !this.guiding && this.showCoutDown();
    },
    showGuide(step) {
        // 显示跳跃引导
        if (step === 0) {
            let mask = pixiUitl.genMask();
            mask.zIndex = 3;
            mask.width = screen.width / 2;
            this.container.addChild(mask);
            let tip = pixiUitl.genSprite('tip_jump');
            tip.zIndex = 3;
            tip.anchor.set(0.5, 0.5);
            tip.x = screen.width / 2;
            tip.y = screen.height / 2;
            this.container.addChild(tip);

            let nextBtn = pixiUitl.genSprite('tip_next');
            nextBtn.zIndex = 3;
            nextBtn.anchor.set(0.5, 0.5);
            nextBtn.x = screen.width / 2 + 200;
            nextBtn.y = tip.y + tip.height / 2 + 200;
            this.container.addChild(nextBtn);

            nextBtn.interactive = true;
            nextBtn.once('tap', ()=> {
                this.container.removeChild(nextBtn);
                this.container.removeChild(tip);
                this.container.removeChild(mask);
                this.showGuide(1);
            });
        }
        // 障碍物提示
        if (step === 1) {
            this.guideCache.barrier.container.zIndex = 3;
            let tip = pixiUitl.genSprite('tip_barrier');
            tip.zIndex = 3;
            tip.anchor.set(0.5, 0.5);
            tip.x = screen.width / 2;
            tip.y = screen.height / 2;
            this.container.addChild(tip);

            let nextBtn = pixiUitl.genSprite('tip_next');
            nextBtn.zIndex = 3;
            nextBtn.anchor.set(0.5, 0.5);
            nextBtn.x = screen.width / 2 + 200;
            nextBtn.y = tip.y + tip.height / 2 + 200;
            this.container.addChild(nextBtn);

            nextBtn.interactive = true;
            nextBtn.once('tap', ()=> {
                this.guideCache.barrier.container.zIndex = 1;
                this.container.removeChild(nextBtn);
                this.container.removeChild(tip);
                this.showGuide(2);
            });
        }
        // 星星提示
        if (step === 2) {
            this.guideCache.star.container.zIndex = 3;
            let tip = pixiUitl.genSprite('tip_star');
            tip.zIndex = 3;
            tip.anchor.set(0.5, 0.5);
            tip.x = screen.width / 2;
            tip.y = screen.height / 2;
            this.container.addChild(tip);

            let nextBtn = pixiUitl.genSprite('tip_next');
            nextBtn.zIndex = 3;
            nextBtn.anchor.set(0.5, 0.5);
            nextBtn.x = screen.width / 2 + 200;
            nextBtn.y = tip.y + tip.height / 2 + 200;
            this.container.addChild(nextBtn);

            nextBtn.interactive = true;
            nextBtn.once('tap', ()=> {
                this.guideCache.star.container.zIndex = 1;
                this.container.removeChild(nextBtn);
                this.container.removeChild(tip);
                this.showGuide(3);
            });
        }
        // 假方块提示
        if (step === 3) {
            this.guideCache.fake.container.zIndex = 3;
            let tip = pixiUitl.genSprite('tip_fake');
            tip.zIndex = 3;
            tip.anchor.set(0.5, 0.5);
            tip.x = screen.width / 2 + 100;
            tip.y = screen.height / 2;
            this.container.addChild(tip);

            let nextBtn = pixiUitl.genSprite('tip_next');
            nextBtn.zIndex = 3;
            nextBtn.anchor.set(0.5, 0.5);
            nextBtn.x = screen.width / 2 + 200;
            nextBtn.y = tip.y + tip.height / 2 + 200;
            this.container.addChild(nextBtn);

            nextBtn.interactive = true;
            nextBtn.once('tap', ()=> {
                this.guideCache.fake.container.zIndex = 1;
                this.container.removeChild(nextBtn);
                this.container.removeChild(tip);
                this.showGuide(4);
            });
        }
        // 更多提示
        if (step === 4) {
            let tip = pixiUitl.genSprite('tip_more');
            tip.zIndex = 3;
            tip.anchor.set(0.5, 0.5);
            tip.x = screen.width / 2;
            tip.y = screen.height / 2;
            this.container.addChild(tip);

            let nextBtn = pixiUitl.genSprite('tip_sure');
            nextBtn.zIndex = 3;
            nextBtn.anchor.set(0.5, 0.5);
            nextBtn.x = screen.width / 2 + 200;
            nextBtn.y = tip.y + tip.height / 2 + 200;
            this.container.addChild(nextBtn);

            nextBtn.interactive = true;
            nextBtn.once('tap', ()=> {
                this.container.removeChild(nextBtn);
                this.container.removeChild(tip);
                monitor.emit('scene:go', 'home');
            });
        }
    },
    listenTouch() {
        this.container.on('pointerdown', (e)=> {
            const {data} = e;
            if (this.isOver) {
                return;
            }
            if (touchId !== null && touchId !== data.identifier) {
                return;
            }
            touchId = data.identifier;
        }).on('pointerup', (e)=> {
            const {data} = e;
            if (touchId === null || touchId !== data.identifier) {
                return;
            }
            let dir = 0;
            if (data.global.x < screen.width / 2) {
                dir = -1;
            } else {
                dir = 1;
            }
            this.jump(dir);
            touchId = null;
        }).on('pointerupoutside', (e) => {
            touchId = null;
        });
    },
    async initBlock() {
        for (let i = 0;i < 5;++i) {
            const line = this.genLine(i, true);
            await line.show();
        }
        let block = this.lineList[0].blockList[0];
        this.bear.onUid = block.uid;
        const pos = this.getBearPos(block);
        this.bear.x = pos.x;
        this.bear.y = pos.y;
        this.bear.bearY = pos.y;
        this.container.addChild(this.bear.container);

        if (this.guiding) {
            let mask = pixiUitl.genMask();
            mask.alpha = 0;
            mask.zIndex = 2;
            this.container.addChild(mask);
            tween({
                from: 0,
                to: 0.7,
                duration: 500
            }).start({
                update: v=> {
                    mask.alpha = v;
                },
                complete: ()=> {
                    this.showGuide(0);
                }
            });
        }
    },
    async showCoutDown() {
        let mask = pixiUitl.genMask();
        mask.alpha = 0.5;
        this.container.addChild(mask);
        let coutdownTip = pixiUitl.genSprite('coutdown3');
        coutdownTip.width = coutdownTip.height = 200;
        coutdownTip.anchor.set(0.5, 0.5);
        coutdownTip.x = screen.width / 2;
        coutdownTip.y = screen.height / 2;
        const startTween = ()=> {
            wx.$sound.coutdown.stop();
            wx.$sound.coutdown.play();
            return new Promise(resolve=> {
                tween({
                    from: 1,
                    to: 0,
                    duration: 1000
                }).start({
                    update: v=> {
                        coutdownTip.scale.x = coutdownTip.scale.y = v;
                    },
                    complete: resolve
                });
            });
        };
        this.container.addChild(coutdownTip);
        await startTween();
        coutdownTip.texture = pixiUitl.getTexture('coutdown2');
        coutdownTip.scale.x = coutdownTip.scale.y = 1;
        await startTween();
        coutdownTip.texture = pixiUitl.getTexture('coutdown1');
        coutdownTip.scale.x = coutdownTip.scale.y = 1;
        await startTween();
        this.container.removeChild(coutdownTip);
        wx.$sound.coutdown_end.stop();
        wx.$sound.coutdown_end.play();
        tween({
            from: 0.5,
            to: 0,
            duration: 500
        }).start({
            update: v=> {
                mask.alpha = v;
            },
            complete: ()=> {
                this.container.removeChild(mask);
                this.starting = true;
            }
        });
    },
    getBearPos(block) {
        const x = block.x + block.width / 2;
        const y = block.y + 32 * block._scale;
        return {x, y};
    },
    genLine(i, allEmpty = false) {
        this.lineNum = i;

        if (i < lineData.length) {
            i = lineData[i];
        } else if (this.lastLineNum === 1) {
            i = 2;
        } else if (this.lastLineNum === 4) {
            i = 3;
        } else {
            i = this.lastLineNum + (Math.random() < 0.5 ? -1 : 1);
        }
        this.lastLineNum = i;
        const lastLine = this.lineList.slice(-1)[0]?.blockList?.map(item=> item.type) || [];
        const line = new Line(screen.height * 0.7 - tplBlock.height * 0.75 * Math.min(this.lineNum, 4));
        this.lineList.push(line);
        
        let type = BLOCK_TYPE.EMPTY;
        let lastType = BLOCK_TYPE.EMPTY;
        for (let j = 0;j < i;++j) {
            let block = null;
            type = BLOCK_TYPE.EMPTY;
            // 非(指定全部为空方块或者只有一个方块)
            if (!allEmpty && i !== 1) {
                // 上一行比当前多
                // 或者是第一个或者最后一个(一定要按这个顺序，这样这个条件就存在于上一行比当前少)
                if (lastLine.length > i || j === 0 || j === i - 1) {
                    // 上一行相邻两个都不是障碍物，则这个位置随机为障碍物
                    if (lastLine[j] !== BLOCK_TYPE.BARRIER && lastLine[j + 1] !== BLOCK_TYPE.BARRIER && lastType !== BLOCK_TYPE.BARRIER) {
                        if (!(lastLine.length > i && (j === 0 || j === i - 1))) {
                            type = Math.random() < (0.4 + this.lineNum * 0.005) ? BLOCK_TYPE.BARRIER : BLOCK_TYPE.EMPTY;
                        }
                    } else if (j + 1 === lastLine.length - 1 && lastLine[j + 1] === BLOCK_TYPE.BARRIER && lastType !== BLOCK_TYPE.BARRIER) {
                        type = Math.random() < (0.4 + this.lineNum * 0.005) ? BLOCK_TYPE.BARRIER : BLOCK_TYPE.EMPTY;
                    }
                } else if (lastLine.length < i && lastLine[j] === BLOCK_TYPE.BARRIER && lastType !== BLOCK_TYPE.BARRIER) {
                    type = Math.random() < (0.4 + this.lineNum * 0.005) ? BLOCK_TYPE.BARRIER : BLOCK_TYPE.EMPTY;
                }
            }
            // 有机会生成道具
            if (type === BLOCK_TYPE.EMPTY && !allEmpty) {
                type = Math.random() < 0.04 ? BLOCK_TYPE.TOOL : BLOCK_TYPE.EMPTY;
            }
            // 有机会生成假方块
            if (type === BLOCK_TYPE.EMPTY && !allEmpty) {
                type = Math.random() < (0.02 + this.lineNum * 0.003) ? BLOCK_TYPE.FAKE : BLOCK_TYPE.EMPTY;
            }
            if (this.guiding && i > 1) {
                // 引导页，固定生成
                if (!this.guideCache.barrier) {
                    type = BLOCK_TYPE.BARRIER;
                    block = blockPool.getBlock(type);
                    block.setBarrier('barrier');
                    this.guideCache.barrier = block;
                } else if (!this.guideCache.star) {
                    type = BLOCK_TYPE.TOOL;
                    block = blockPool.getBlock(type);
                    block.setToolType(TOOL_TYPE.SCORE);
                    this.guideCache.star = block;
                } else if (!this.guideCache.fake) {
                    type = BLOCK_TYPE.FAKE;
                    block = blockPool.getBlock(type);
                    this.guideCache.fake = block;
                } else {
                    type = BLOCK_TYPE.EMPTY;
                    block = blockPool.getBlock(type);
                }
            } else {
                lastType = type;
                block = blockPool.getBlock(type);
                if (type === BLOCK_TYPE.BARRIER) {
                    block.setBarrier('barrier');
                }
                if (type === BLOCK_TYPE.TOOL) {
                    block.setToolType(Math.random() < 0.5 ? TOOL_TYPE.SCORE : TOOL_TYPE.SHIELDING);
                }
            }
            block.width = screen.width / 5;
            block.alpha = 0;
            this.container.addChildAt(block.container, 1);
            line.push(block);
        }
        return line;
    },
    addScore(score) {
        this.score += score;
        this.scoreText.text = `${this.score}`;
    },
    jumpToNext(pos, end) {
        tween({
            from: {
                x: this.bear.x,
                y: this.bear.y,
            },
            to: {
                x: pos.x,
                y: pos.y,
            },
            ease: easing.easeIn,
            duration: 100,
        }).start({
            update: v => {
                this.bear.x = v.x;
                this.bear.y = v.y;
            },
            complete: ()=> {
                tween({
                    from: this.bear.y,
                    to: end,
                    ease: easing.easeIn,
                    duration: 50,
                }).start({
                    update: v => {
                        this.bear.y = v;
                    }
                });
            }
        });
    },
    jumpToFall() {
        tween({
            from: this.bear.y,
            to: this.bear.y - 100,
            ease: easing.easeIn,
            duration: 100,
        }).start({
            update: v => {
                this.bear.y = v;
            },
            complete: ()=> {
                tween({
                    from: this.bear.y,
                    to: screen.height + this.bear.height * 2,
                    ease: easing.easeIn,
                    duration: 50,
                }).start({
                    update: v => {
                        this.bear.y = v;
                    }
                });
            }
        });
    },
    fall() {
        tween({
            from: this.bear.y,
            to: screen.height + this.bear.height * 2,
            ease: easing.easeIn,
            duration: 50,
        }).start({
            update: v => {
                this.bear.y = v;
            }
        });
    },
    async jump(dir) {
        if (!this.starting || this.lockTouch || this.isOver || dir === 0) {
            return;
        }
        this.lockTouch = true;
        wx.$sound.tap.stop();
        wx.$sound.tap.play();

        let diff = dir;
        let firstLine = this.lineList.shift();
        const nextLine = this.lineList[0];
        if (nextLine.length > firstLine.length && dir < 0) {
            diff += 1;
        } else if (nextLine.length < firstLine.length && dir > 0) {
            diff -= 1;
        }
        this.linePos += diff;
        if (this.linePos < 0 || this.linePos === nextLine.length) {
            this.isOver = true;
        }
        this.bear.skew.y = dir < 0 ? 22 : 0;

        // 没结束，有跳跃动画
        if (!this.isOver) {
            const block = nextLine.blockList[this.linePos];
            const pos = this.getBearPos(block);
            if (block.type === BLOCK_TYPE.EMPTY) {
                this.finishScore++;
                this.addScore(1);
            } else if (block.type === BLOCK_TYPE.TOOL) {
                this.dealTool(block);
            } else if (block.type === BLOCK_TYPE.FAKE) {
                this.finishScore++;
                this.addScore(1);
                block.waitToFall = true;
                wx.$util.delay(500)
                    .then(()=> {
                        block.fall()
                            .then(async ()=> {
                                if (this.bear.onUid === block.uid) {
                                    this.isOver = true;
                                    this.fall();
                                    await wx.$util.delay(200);
                                    this.showEnd();
                                }
                            });
                    });
            } else if (block.type === BLOCK_TYPE.BARRIER) {
                if (this.bear.invincible) {
                    block.hideBarrier();
                } else {
                    this.isOver = true;
                }
            }
            this.jumpToNext(pos, this.isOver ? (screen.height + this.bear.height * 2) : this.bear.bearY);
            this.bear.onUid = block.uid;
        } else {
            // 结束，向上跳然后掉下来
            this.jumpToFall();
        }

        // 最下面一行方块掉落
        firstLine.blockList.forEach(block=> {
            block.startToFall();
            tween({
                from: {
                    y: block.y,
                    alpha: 1
                },
                to: {
                    y: screen.height,
                    alpha: 0
                },
                ease: easing.easeIn,
                duration: 200,
            }).start({
                update: v => {
                    block.y = v.y;
                    block.alpha = v.alpha;
                },
                complete: ()=> {
                    this.container.removeChild(block.container);
                    blockPool.recycle(block);
                }
            });
        });
        let top = firstLine.top;
        this.lineNum++;
        // 所有方块向下移动
        this.lineList.forEach(line=> {
            let tmp = line.top;
            line.setTop(top);
            line.animTop();
            top = tmp;
        });
        // 生成一行新方块
        const newLine = this.genLine(this.lineNum);
        newLine.show(150, 100);

        this.lockTouch = false;

        if (this.isOver) {
            await wx.$util.delay(200);
            this.showEnd();
        }
    },
    dealTool(block) {
        block.use();
        switch(block.toolType.id) {
        case TOOL_TYPE.SCORE.id:
            wx.$sound.score.stop();
            wx.$sound.score.play();
            this.finishScore += block.toolType.data;
            this.flyStar(block.x, block.y, block.toolType.data);
            break;
        case TOOL_TYPE.SHIELDING.id:
            wx.$sound.shielding.stop();
            wx.$sound.shielding.play();
            this.bear.showShielding(block.toolType.time);
            break;
        }
    },
    flyStar(sx, sy, num) {
        const angle = 360 / num;
        for (let i = 0, a = 0;i < num;++i, a += angle) {
            // 计算小粒子的位置
            let x = 100 * (Math.abs(a) ===  90 ? 0 : Math.cos(a * Math.PI / 180)) + sx;
            let y = 100 * (Math.abs(a) ===  180 ? 0 : Math.sin(a * Math.PI / 180)) + sy;
            let particle = pixiUitl.genSprite('score');
            particle.x = sx;
            particle.y = sy;
            particle.scale.x = particle.scale.y = 0.7;
            this.container.addChild(particle);
            // 现将小粒子扩散到四周再随机时间内飞到分数那里
            tween({
                from: {
                    x: sx,
                    y: sy
                },
                to: {
                    x: x,
                    y: y
                },
                duration: 200
            }).start({
                update: v=> {
                    particle.x = v.x;
                    particle.y = v.y;
                },
                complete: ()=> {
                    tween({
                        from: {
                            x: sx,
                            y: sy,
                            scale: 0.7
                        },
                        to: {
                            x: this.scoreText.x,
                            y: this.scoreText.y,
                            scale: 0.4
                        },
                        duration: Math.random() * 500 + 200
                    }).start({
                        update: v=> {
                            particle.x = v.x;
                            particle.y = v.y;
                            particle.scale.x = particle.scale.y = v.scale;
                        },
                        complete: ()=> {
                            this.addScore(1);
                            this.container.removeChild(particle);
                        }
                    });
                }
            });
        }
    },
    async showEnd() {
        if (this.startShowEnd) {
            return;
        }
        this.startShowEnd = true;
        wx.$sound.fail.play();
        wx.$open.showEnd(this.finishScore);
        let mask = pixiUitl.genMask();
        this.container.addChild(mask);
        wx.showLoading();
        await wx.$util.delay(500);
        wx.hideLoading();
        this.showEnding = true;
        this.container.addChild(this.endSprite);
        ticker.add(this.update, this);

        let replay = pixiUitl.genSprite('btn_replay');
        const scale = this.endSprite.width / replay.width;
        replay.scale.x = replay.scale.y = scale;
        replay.x = this.endSprite.x;
        replay.y = this.endSprite.y + this.endSprite.height + 40;
        this.container.addChild(replay);

        replay.interactive = true;
        replay.once('tap', (e)=> {
            this.removeAll();
            this.init();
        });

        let home = pixiUitl.genSprite('btn_home');
        home.scale.x = home.scale.y = scale;
        home.x = this.endSprite.x;
        home.y = replay.y + replay.height + 40;
        this.container.addChild(home);

        home.interactive = true;
        home.once('tap', (e)=> {
            this.hide();
            monitor.emit('scene:go', 'home');
        });

        let share = pixiUitl.genSprite('btn_share');
        share.scale.x = share.scale.y = scale;
        share.x = this.endSprite.x + 20 + home.width;
        share.y = home.y;
        this.container.addChild(share);

        share.interactive = true;
        share.on('tap', (e)=> {
            monitor.emit('wx:share', {
                title: `我的小熊跳了${this.finishScore}分，你能超越我吗~`
            });
        });

        await wx.$util.delay(10000);
        this.showEnding = false;
    },
    update() {
        if (this.showEnding) {
            // 显示结束分数
            canvas = wx.$open.getCanvas();
            let texture = new PIXI.BaseTexture(canvas);
            this.endSprite.texture = new PIXI.Texture(texture);
        }
    }
};