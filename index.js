/**
 * 命令行工具开发辅助工具函数集合 
 * 具体的使用说明详见： https://github.com/lilindog/cmdhelper
 */

module.exports = nameSpace = Object.create(null);

const select = require("./lib/select");
const loading = require("./lib/loading");
const progress = require("./lib/progress");
const question = require("./lib/question");
const cmd = require("./lib/cmd");

/**
 * 单选选择
 * 
 * @param {String} title 标题
 * @param {Array} options 选项数组，如: [{label: "选项", ...}, ...]
 * @param {Function} cb 选择确定回调函数，可选，没有则返回promise
 */
nameSpace["select"] = select;

/**
 * 确认
 * 
 * @param {String} title 标题文本
 * @param {Object} options 确定、取消显示文本，如：{confirmText: "", cancelText: ""}
 * @return {Promise} resove(boolean)
 */
nameSpace["confirm"] = async (title = "确定？", options = {confirmText: "确定", cancelText: "取消"}) => {
    const is = await select(title, [
        {label: options.confirmText},
        {label: options.cancelText}
    ]);
    return is.label === options.confirmText ? true : is.label === options.cancelText ? false : null;
}

/**
 * 加载动画
 * 
 * @param {String} text 加载提示文本
 * @param {Array} chars 加载动画变画文本，可选
 * @param {Number} duration 动画间隔时间，可选
 * @return {Function} 执行该函数停止动画，参数为可选的提示文本
 */
nameSpace["loading"] = loading;
    
/**
 * 进度条
 * 
 * @param {Number} length 进度条整体长度
 * @return {Object} // { stop([String[]]), step(Number [, String[]]) }
 */
nameSpace["progress"] = progress;

/**
 * 问题
 * 
 * @param {String} questionMessage 问题
 * @param {Funct6ion} cb 可选，问题答案回调, 如果缺省则函数返回答案
 */
nameSpace["question"] = question;

/**
 * 命令行工具 
 * 
 * @param {String} name 可选，命令行名字，如：cli copy -i xxx -o xxx, 这里的copy就是name
 * @param {Array}  descripts 命令行参数描述数组，详见命令行描述说明 "./lib/cmd/README.md"
 * @param {Function} cb 当命令行名字匹配，就会执行这个回调，参数为命令行描述参数集合对象
 */
nameSpace["cmd"] = cmd;