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
        this.tokens = [];
        this.tokenTypes = {
            LEFT:           "LEFT",
            LEFT_REQUIRED:  "LEFT_REQUERED",
            PARAM:          "PARAM",
            OPTION:         "OPTION",
            COMMA:          "COMMA",
            RIGHT:          "RIGHT",
            RIGHT_REQUIRED: "RIGHT_REQUIRED",
            STRING:         "STRING",
            SUMM:           "SUMM"
        }
        this._stringReg = /[a-z0-9\u4e00-\u9fa5]/i;
        this._latterReg = /[a-z]/i;
    }
    parse () {
        while (this.index < this.source.length) {
            this._skipSpacing();
            const char = this.source[this.index];
            this._checkChar(char);
            switch (char) {
                case "<":
                    this.tokens.push(new Token(this.index, this.index, "<", this.tokenTypes.LEFT_REQUIRED));
                    this.index++;
                    continue;
                    break;
                case "[":
                    this.tokens.push(new Token(this.index, this.index, "[", this.tokenTypes.LEFT));
                    this.index++;
                    continue;
                    break;
                case "-":
                    this._parseParamOrOption();
                    continue;
                    break;
                case ",":
                    this.tokens.push(new Token(this.index, this.index, ",", this.tokenTypes.COMMA));
                    this.index++;
                    continue;
                    break;
                case ">":
                    this.tokens.push(new Token(this.index, this.index, ">", this.tokenTypes.RIGHT_REQUIRED));
                    this.index++;
                    continue;
                    break;
                case "]":
                    this.tokens.push(new Token(this.index, this.index, "]", this.tokenTypes.RIGHT));
                    this.index++;
                    continue;
                    break;
                case "`":
                    this._readSumm();
                    continue;
                    break;
                default:
                    this._readString();
            }
        }
        return this.tokens;
    }
    _parseParamOrOption () {
        let startIndex = this.index, str = "", type = null, char = this.source[++this.index];
        if (char === "-") {
            type = this.tokenTypes.OPTION;
            str += "--";
            this.index++;
        } else {
            type = this.tokenTypes.PARAM;
            str += "-";
        }
        while (true) {
            char = this.source[this.index];
            if (this._latterReg.test(char)) {
                str += char;
                this.index++;
            } 
            else {
                break;
            }
        }
        this.tokens.push(new Token(startIndex, this.index, str, type));
    }
    _readSumm () {
        let str = "", startIndex = this.index++;
        while (true) {
            const char = this.source[this.index];
            if (char === "`") {
                this.index++;
                break;
            }
            else if (char === undefined) {
                this._throw();
            }
            else {
                str += char;
                this.index++;
            }
        }
        this.tokens.push(new Token(startIndex, this.index, str, this.tokenTypes.SUMM));
    }
    _readString () {
        let str = "";
        const startIndex = this.index;
        while (true) {
            const char = this.source[this.index];
            if (this._stringReg.test(char) && char !== undefined) {
                str += char;
                this.index++;
            } else {
                break;
            }
        }
        this.tokens.push(new Token(startIndex, this.index, str, this.tokenTypes.STRING));
    }
    _checkChar (char) {
        const allowSigns = ["<", "[", "-", ",", ">", "]", "`"];
        if (!allowSigns.includes(char) && !this._stringReg.test(char)) {
            this._throw();
        }
    }
    _skipSpacing () {
        while (this.source[this.index] === " ") {
            this.index++;
        }   
    }
    _throw () {
        let str = this.source + "\n";
        for (let i = 0; i < this.index; i++) {
            str += " ";
        }
        str += "^";
        throw str;
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


//test
const str = "<-n, name string> `this is you name";
const p = new ParseTokens(str);
console.log(p.parse());