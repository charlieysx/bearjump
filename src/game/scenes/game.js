import {stage, screen, monitor} from '../core';
import {tween, easing} from 'popmotion';

let touchId = null;

const lineData = [1, 2, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4];

const BLOCK_TYPE = {
    EMPTY: 0, // 空
    BARRIER: 1, // 障碍物
    TOOL: 2 // 道具
};

class Block {
    constructor(bg) {
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
}

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
    }

    setTool(name) {
        this.tool.texture = pixiUitl.getTexture(name);
        return this;
    }

    setTag(tag) {
        this.tag = tag;
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
            default:
                return null;
            }
        } else {
            return list.shift();
        }
    }

    recycle(block) {
        this.blockList[block.type].push(block);
    }
}

const blockPool = new Pool();
let tplBlock = null;

export default {
    show() {
        this.init();
        monitor.emit('scene:show', 'home');
    },
    hide() {
        while(this.lineList.length) {
            const line = this.lineList.pop();
            line.forEach(block=> blockPool.recycle(block));
        }
        this.container.addChild(this.bear);
        this.container.destroy({children: true});
        monitor.emit('scene:hide', 'home');
    },
    init() {
        this.lockTouch = false;
        this.isOver = false;
        this.lineList = [];
        this.lineNum = 0;
        this.linePos = 0;
        this.lastLineNum = 0;
        this.score = 0;
        this.finishScore = 0;
        this.bearY = 0;
        tplBlock = blockPool.getBlock(BLOCK_TYPE.EMPTY);
        tplBlock.width = screen.width / 5;

        this.bear = pixiUitl.genSprite('bear');
        this.bear.width *= tplBlock._scale;
        this.bear.height *= tplBlock._scale;
        this.bear.anchor.set(0.5, 0.8);

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

        this.listenTouch();
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
        const pos = this.getBearPos(this.lineList[0].blockList[0]);
        this.bear.x = pos.x;
        this.bear.y = pos.y;
        this.bearY = pos.y;
        this.container.addChild(this.bear);
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
            if (type === BLOCK_TYPE.EMPTY && !allEmpty) {
                type = Math.random() < 0.05 ? BLOCK_TYPE.TOOL : BLOCK_TYPE.EMPTY;
            }
            lastType = type;
            block = blockPool.getBlock(type);
            if (type === BLOCK_TYPE.BARRIER) {
                block.setBarrier('barrier');
            }
            if (type === BLOCK_TYPE.TOOL) {
                block.setTool('score').setTag('addScore10');
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
    jump(dir) {
        if (this.lockTouch || this.isOver || dir === 0) {
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
            // this.jumpToNext(pos, this.bearY);
            if (block.type === BLOCK_TYPE.EMPTY) {
                this.finishScore++;
                this.addScore(1);
            } else if (block.type === BLOCK_TYPE.TOOL) {
                this.dealTool(block);
            } else {
                this.isOver = true;
            }
            this.jumpToNext(pos, this.isOver ? (screen.height + this.bear.height * 2) : this.bearY);
        } else {
            // 结束，向上跳然后掉下来
            this.jumpToFall();
        }

        // 最下面一行方块掉落
        firstLine.blockList.forEach(block=> {
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
            wx.$sound.fail.play();
            wx.showModal({
                title: '游戏结束',
                content: this.scoreText.text + '分',
                showCancel: false,
                confirmText: '确定',
                confirmColor: '#3CC51F',
                success: res => {
                    monitor.emit('scene:go', 'home');
                }
            });
        }
    },
    dealTool(block) {
        block.use();
        switch(block.tag) {
        case 'addScore10':
            wx.$sound.score.stop();
            wx.$sound.score.play();
            this.finishScore += 10;
            this.flyStar(block.x, block.y, 10);
            break;
        }
    },
    flyStar(sx, sy, num) {
        const angle = 360 / num;
        for (let i = 0, a = 0;i < num;++i, a += angle) {
            // 计算小粒子的位置
            let x = 100 * (Math.abs(a) ===  90 ? 0 : Math.cos(a * Math.PI / 180)) + sx;
            let y = 100 * (Math.abs(a) ===  180 ? 0 : Math.sin(a * Math.PI / 180)) + sy;
            let particle = pixiUitl.genSprite('star');
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
    }
};