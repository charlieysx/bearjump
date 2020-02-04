import {install} from '@pixi/unsafe-eval';

install(PIXI);

PIXI.settings.PREFER_ENV = PIXI.ENV.WEBGL;
PIXI.settings.PRECISION_FRAGMENT = PIXI.PRECISION.HIGH;
PIXI.settings.SORTABLE_CHILDREN = true;
window.WebGLRenderingContext = {};

/* 云开发 环境名 */
PIXI.settings.CLOUD_ENV = 'wx-demo-mo9m4';