import { screen } from '../core';

const { canvas } = wx.getOpenDataContext();

canvas.width = screen.width * .9;
canvas.height = screen.height * .6;
