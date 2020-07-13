"use strict"

const parseDescript = require("./lib/parseDescript");
const cmdparse = require("./lib/cmdparser");

module.exports = function (
    cmd = "", 
    descripts = [], 
    cb
) {
    let 
    ds = null,
    ps = null;
    try {
        ds = parseDescripts(descripts);
        ps = cmdparse();
        checkParams(ds, ps);
    } catch(err) {
        console.log(err);
        return;
    }
    console.log("ok");
}

function checkParams (ds, ps) {
    const psclone = {};
    ps.params.forEach(i => psclone[i.key] = i);
    //必选参数
    ds.filter(item => item.required).forEach(item => {
        if (psclone[item.key]) {
            delete psclone[item.key];
        } 
        else if (psclone[item.subkey]) {
            delete psclone[item.subkey];
        } 
        else {
            throw `必选参数未指定：\n${item.raw}`;
        }
    });
    //多余无效参数
    const overPs = Object.keys(psclone).map(key => psclone[key].raw);
    if (overPs.length) {
        throw `多余的参数: \n${overPs.join("\n")}`;
    }
}

function parseDescripts (descripts = []) {
    return descripts.map(i => parseDescript(i));
}