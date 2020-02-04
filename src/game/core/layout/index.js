class Layout extends PIXI.Container {
    static GRID = 2;
    static VERTICAL = 1;
    static HORIZONTAL = 0;

    #added = false;

    constructor(opt = {}) {
        super();
        this.col = opt.col == null ? 3 : opt.col;
        this.type = opt.type == null ? Layout.HORIZONTAL : opt.type;
        this.gap = opt.gap || 0;
        this.#listen();
    }

    #render() {
        switch (this.type) {
        case Layout.HORIZONTAL: {
            let tx = 0;
            this.children.forEach((child, i) => {
                const {width, pivot, scale} = child;
                const rect = child.getLocalBounds();
                const ax = -rect.x / rect.width;
                const pw = pivot.x * scale.x;
                const aw = ax * width;

                child.x = i ? this.gap + tx + aw + pw : aw + pw;
                tx = child.x + width - (aw + pw);
            })
            break;
        }

        case Layout.VERTICAL: {
            let ty = 0;
            this.children.forEach((child, i) => {
                const {height, pivot, scale} = child;
                const rect = child.getLocalBounds();
                const ay = -rect.y / rect.height;
                const ph = pivot.y * scale.y;
                const ah = ay * height;

                child.y = i ? this.gap + ty + ah + ph : ah + ph;
                ty = child.y + height - (ah + ph);
            })
            break;
        }

        case Layout.GRID: {
            const {col, gap} = this;
            let tx = 0;
            let ty = 0;
            let max = 0;
            this.children.forEach((child, i) => {
                const {height, width, pivot, scale} = child;
                const rect = child.getLocalBounds();
                const ay = -rect.y / rect.height;
                const ax = -rect.x / rect.width;
                const ph = pivot.y * scale.y;
                const pw = pivot.x * scale.x;
                const ah = ay * height;
                const aw = ax * width;
                const ix = i % col;
                const iy = ~~(i / col);

                child.x = ix ? gap + tx + aw + pw : aw + pw;
                tx = child.x + width - (aw + pw);

                child.y = iy ? gap + ty + ah + ph : ah + ph;
                max = Math.max(max, child.y + height - (ah + ph));
                ix === col - 1 ? ty = max : 0;
            })
            break;
        }
        }
    }

    onChildrenChange() {
        this.#added && this.#render();
    }

    #listen() {
        this.on('added', () => {
            this.#added = true;
            this.#render();
        }).on('removed', () => {
            this.#added = false;
        })
    }
}

PIXI.Layout = Layout;
