"use strict"

const parseDescript = require("./lib/parseDescript");
const cmdparse = require("./lib/cmdparser");

module.exports = function (
    cmd, 
    descripts, 
    cb
) {
    if (Array.isArray(cmd)) {
        cb = descripts
        descripts = cmd;
        cmd = "";
    }
    let 
    ds = null,
    ps = null,
    params = {};
    try {
        ds = parseDescripts(descripts);
        ps = cmdparse();
        params = checkParams(ds, ps);
    } catch(err) {
        console.log(err);
        return;
    }
    if (ps.cmd === cmd) {
        if (cb) {
            cb(params);
        }
        else {
            return params;
        }
    } else {
        return false;
    }
}

function checkParams (ds, ps) {
    //检查多余参数、option
    const arr = ps.params.map(item => {
        if (!ds.find(i => i.flag === item.key)) {
            return item.raw;
        }
    }).filter(i => i);
    const arr1 = ps.options.map(item => {
        if (!ds.find(i => i.flag === item.key)) {
            return item.raw;
        }
    }).filter(i => i);
    if (arr.length || arr1.length) {
        throw `多余无效参数、选项：\n\n    ${[...arr, ...arr1].join("\n    ")}`;
    }
    //检查必选参数
    const arr2 = [];
    ds.forEach(({flag, raw}) => {
        if (!ps.params.find(i => i.key === flag) && !ps.options.find(i => i.key === flag)) {
            arr2.push(raw);
        }
    });
    if (arr2.length) {
        throw `缺少必要参数、选项：\n\n    ${arr2.join("\n    ")}`;
    }
    //格式化cb需要的参数
    const params = {};
    ds.forEach(item => {
        const r = ps.params.find(i => i.key === item.flag);
        r && (params[item.key] = r.value);
    });
    ds.forEach(item => {
        const r = ps.options.find(i => i.key === item.flag);
        r && (params[item.key] = r.value);
    });
    return params;
}

function parseDescripts (descripts = []) {
    return descripts.map(i => parseDescript(i));
}