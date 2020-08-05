"use strict"

class State {
    constructor (states = {}) {
        this.states = states;
        this.curr = this._getFirstState();
    }
    _getFirstState () {
        const keys = Object.keys(this.states);
        return this.states[keys[0]];
    }
    next (state) {
        if (state) {
            const nextState = this.states[state];
            if (!nextState) throw "next State is undefined";
            this.curr = this.states[state];
        } else {
            const keys = Object.keys(this.states);
            for (let i = 0; i < keys.length; i++) {
                let key = keys[i];
                if (this.states[key] === this.curr) {
                    key = keys[i + 1];
                    this.curr = this.states[key];
                    break;
                }
            }
        }
    }
}

class Res {
    constructor () {
        this.required = false;
        this.isParam = false;
        this.isOption = false;
        this.flag = "";
        this.key = "";
        this.type = "";
        this.default = "";
        this.summary = "";
        this.raw = "";
    }
}

class Token {
    constructor (
        startPosition,
        endPosition,
        content,
        type
    ) {
        this.startPosition = startPosition;
        this.endPosition = endPosition;
        this.content = content;
        this.type = type;
    }
}

class ParseTokens {
    constructor (source) {
        this.source = source;
        this.index = 0;
    }
    parse () {
        
    }
    _skipSpacing () {
        while (this.source[this.index] === " ") {
            this.index++;
        }
    }
}

class Lexer {
    constructor () {

    }
}

/**
 * 语法分析 
 */
function lexer (source) {
    const tokens = parseTokens(source);
    const res = new Res;
    const state = new State;
    res.raw = source;
    INDEX = 0;
    while (true) {
        switch (state.curr) {
            case state.states.TAG:
                parseTAG();
                continue;
            break;
            case state.states.TYPE:
                parseTYPE();
                continue;
            break;
            case state.states.DEFAULT:
                parseDEFAULT();
                continue;
            break;
            case state.states.SUMM:
                parseSUMM();
                continue;
            break;
            case state.states.END:
                return res;
            case state.states.ERROR:
                error();
        }
    }
    function parseTAG () {
        for (let f of [
            () => {
                let token = tokens[INDEX];
                if (token.type === tokenTypes.LEFT) res.required = false;
                else if (token.type === tokenTypes.LEFT_REQUIRED) res.required = true;
                else state.next("ERROR");
            },
            () => {
                let token = tokens[++INDEX];
                if (token.type === tokenTypes.TAG || token.type === tokenTypes.OPTION) {
                    res.flag = token.content;
                    token.type === tokenTypes.TAG && (res.isParam = true);
                    token.type === tokenTypes.OPTION && (res.isOption = true);
                }
                else state.next("ERROR");
            },
            () => {
                let token = tokens[++INDEX];
                if (token.type !== tokenTypes.COMMA) state.next("ERROR");
            },
            () => {
                let token = tokens[++INDEX];
                if (token.type === tokenTypes.STRING) res.key = token.content;
                else state.next("ERROR");
            },
            () => {
                let token = tokens[++INDEX];
                if (res.required) {
                    if (token.type !== tokenTypes.RIGHT_REQUIRED) state.next("ERROR");
                } else {
                    if (token.type !== tokenTypes.RIGHT) state.next("ERROR");
                }
            }
        ]) {
            if (state.curr === state.states.ERROR)  return;
            else f();
        }
        if (state.curr === state.states.ERROR) return;
        INDEX++;
        state.next();
    }
    function parseTYPE () {
        const token = tokens[INDEX];
        if (res.required) {
            if (types.includes(token.content) && token.type === tokenTypes.STRING) res.type = token.content;
            else return state.next("ERROR");
        }
        else {  
            if (types.includes(token.content) && token.type === tokenTypes.STRING) {
                res.type = token.content;
            } else {
                return state.next("SUMM");
            }
        }
        INDEX++;
        state.next();
    }
    function parseDEFAULT () {
        const token = tokens[INDEX];
        //可选才有默认值，并且要求type声名的情况下才能有
        if (!res.required && res.type) {
            if (!tokens[INDEX + 1])  return state.next();
            if (token.type === tokenTypes.STRING) {
                res.default = token.content;
                INDEX++;
                return state.next();
            }
            else return state.next("ERROR");
        }
        state.next();
    }
    function parseSUMM () {
        const token = tokens[INDEX];
        if (token.type === tokenTypes.STRING) res.summary = token.content;
        else return state.next("ERROR");
        state.next("END");
    }
    function error () {
        let str = source + "\n";
        const max = tokens[INDEX] ? tokens[INDEX].startPosition : source.length + 1;
        for (let i = 0; i < max; i++) {
            str += " ";
        }
        str += "^";
        throw `DESCRIPT声明语法错误：\n${str}`;
    }
}