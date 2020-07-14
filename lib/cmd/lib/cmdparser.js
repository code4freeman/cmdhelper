"use strict"

class Flag {
    constructor (key = "", value = null, raw = "") {
        this.key = key;
        this.value = value;
        this.raw = raw;
    }
}

class Res {
    constructor () {
        this.cmd = "";
        this.params = [];
        this.options = [];
    }
    static getPrev (ctx) {
        return ctx.params.find(i => i.value === null);
    }
    static appendFlag (ctx, flag) {
        if (ctx.params.find(i => i.key === flag.key)) throw `参数重复 "${flag.raw}"`;
        ctx.params.push(flag);
    }
    static appendOption (ctx, flag) {
        if (ctx.options.find(i => i.key === flag.key)) throw `选项重复 "${flag.raw}"`;
        ctx.options.push(flag);
    }
}

const state = {
    CMD: "CMD",
    NAME: "NAME",
    PARAM: "PARAM",
    OPTION: "OPTION"
}

module.exports = function (args = []) {
    if (args.length === 0) {
        args = process.argv.slice(2);
    }
    let 
    res = new Res,
    currentState = state.CMD;
    while (args.length) {
        switch (currentState) {
            case state.CMD: 
                handleCMD();
                continue;
            break;
            case state.NAME: 
                handleNAME();
                continue;
            break;
            case state.PARAM: 
                handlePARAM();
                continue;
            break;
            case state.OPTION:
                handleOPTION();
                continue;
            break;
            default: break;
        }
    }
    return res;
    function handleCMD () {
        const p = args[0];
        if (/-/g.test(p) || /--/g.test(p)) {
            currentState = state.NAME;
        } else {
            res.cmd = args.shift();
            currentState = state.NAME;
        }
    }
    function handleNAME () {
        let p = args[0];
        if (/^-[^-]+/.test(p)) {
            p = args.shift();
            Res.appendFlag(res, new Flag(p, null, p));
            currentState = state.PARAM;
        } else if (/^--[^-]+/.test(p)) {
            currentState = state.OPTION;
        } else {
            throw `"${p}" 应该为参数声明, 参数声明开头应该带 "-" 或 "--"!`;
        }
    }
    function handleOPTION () {
        const p = args.shift();
        if (/^--/.test(p)) {
            if (/=/.test(p)) {
                const arr = p.split("=");
                Res.appendOption(res, new Flag(arr[0], arr[1], p));
            } else {
                Res.appendOption(res, new Flag(p, true, p));
            }
        } else {
            throw `"${p}" 选项应该为 "--" 开头，并且参数为 "--option=xx 来指定`;
        }
        currentState = state.NAME;
    }
    function handlePARAM () {
        const p = args.shift();
        if (/^-/.test(p) || /^--/.test(p)) {
            throw `"${p}" 应该为为参数，不应该为 "-" 或者 "--" 开头`;
        } else {
            const flag = Res.getPrev(res);
            flag.value = p;
            flag.raw += ` ${p}`;
            currentState = state.NAME;
        }
    }
}