import {stage, screen, monitor} from '../core';

export default {
    init() {
        this.container = new PIXI.Container();
        this.container.interactive = true;

        const bg = pixiUitl.genSprite('bg');
        bg.width = screen.width;
        bg.height = screen.height;
        this.container.addChild(bg);
        
        const logo = pixiUitl.genSprite('logo');
        logo.x = screen.width / 2;
        logo.y = screen.height / 2 - 200;
        logo.anchor.set(0.5, 0.5);
        this.container.addChild(logo);
        
        const start = pixiUitl.genSprite('start');
        start.x = screen.width / 2;
        start.y = screen.height / 2 + 300;
        start.anchor.set(0.5, 0.5);
        this.container.addChild(start);

        start.interactive = true;
        start.once('tap', (e)=> {
            this.hide();
            monitor.emit('scene:go', 'game');
        });

        stage.addChild(this.container);
    },

    show() {
        this.init();
        monitor.emit('scene:show', 'home');
    },

    hide() {
        this.container.destroy({children: true});
        monitor.emit('scene:hide', 'home');
    }
};