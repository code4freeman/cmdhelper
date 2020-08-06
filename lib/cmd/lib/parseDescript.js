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
        this.tokenTypes = ParseTokens.tokenTypes;
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
        let str = "token错误： \n\n" + this.source + "\n";
        for (let i = 0; i < this.index; i++) {
            str += " ";
        }
        str += "^";
        throw str;
    }
}
ParseTokens.tokenTypes = {
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

class Lexer {
    constructor (source) {
        this.source = source;
        this.tokens = new ParseTokens(source).parse();
        this.res = new Res;
        this.res.raw = source;
        this.state = new State({
            TAG:     "ATG",
            TYPE:    "TYPE",
            DEFAULT: "DEFAULT",
            SUMM:    "SUMM"
        });
        this.index = 0;
    }
    parse () {
        const state = this.state;
        while (this.index < this.tokens.length - 1) {
            switch (state.curr) {
                case state.states.TAG:
                    this._parseTag();
                    continue;
                break;
                case state.states.TYPE:
                    this._parseType();
                    continue;
                break;
                case state.states.DEFAULT:
                    this._parseDefault();
                    continue;
                break;
                case state.states.SUMM:
                    this._parseSumm();
                    continue;
            }
        }
        return this.res;
    }
    _parseTag () {
        const types = ParseTokens.tokenTypes, res = this.res, tokens = this.tokens;
        let token = tokens[this.index] || {};
        if (token.type === types.LEFT) res.required = false;
        else if (token.type === types.LEFT_REQUIRED) res.required = true;
        else this._throw();
        token = tokens[++this.index] || {};
        if (token.type === types.PARAM) {
            res.isParam = true;
            res.flag = token.content;
        }
        else if (token.type === types.OPTION) {
            res.isOption = true;
            res.flag = token.content;
        }
        else this._throw();
        token = tokens[++this.index] || {};
        if (token.type !== types.COMMA) this._throw();
        token = tokens[++this.index] || {};
        if (token.type === types.STRING) res.key = token.content;
        else this._throw();
        token = tokens[++this.index] || {};
        if (res.required) {
            if (token.type === types.RIGHT) this._throw();
        } else {
            if (token.type === types.RIGHT_REQUIRED) this._throw();
        }
        this.state.next();
    }
    _parseType () {
        const tokens = this.tokens, types = ParseTokens.tokenTypes, res = this.res, token = tokens[++this.index];
        const allowParamTypes = ["string", "number"];
        if (res.required) {
            if (token.type !== types.STRING) this._throw();
            if (!allowParamTypes.includes(token.content)) this._throw();
            res.type = token.content;
            this.state.next("SUMM");
        } else {
            if (token.type === types.STRING) {  
                if (allowParamTypes.includes(token.content)) {
                    res.type = token.content;
                    this.state.next();
                } else {
                    this._throw();
                }
            } else {
                this.index--;
                this.state.next("SUMM");
            }
        }
    }
    _parseDefault () {
        const tokens = this.tokens, token = tokens[++this.index];
        if (token.type !== ParseTokens.tokenTypes.STRING) {
            this.index--;
            this.state.next();
        } else {
            this.res.default = token.content;
            this.state.next();
        }
    }
    _parseSumm () {
        const tokens = this.tokens, token = tokens[++this.index];
        if (token.type !== ParseTokens.tokenTypes.SUMM) this._throw();
        this.res.summary = token.content;
        if (tokens[++this.index]) this._throw();
    }
    _throw () {
        const token = this.tokens[this.index];
        let str = "语法错误：\n\n" + this.source + "\n";
        for (let i = 0; i < token.startPosition; i++) {
            str += " ";
        }
        for (let i = 0; i < token.content.length; i++) {
            str += "^"
        }
        throw str;
    }
}

module.exports = source => new Lexer(source).parse();