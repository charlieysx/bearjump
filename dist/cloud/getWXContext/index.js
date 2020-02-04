// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init();

exports.main = () => {
    return cloud.getWXContext();
};