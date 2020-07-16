# 参数声明模板语法

```js
//必选参数声明
//必须按参数的类型不能缺省，且不能指定默认值
<-p, param> string|number 描述文本

//可选参数声明
[-p, param] string|number 描述文本

//选项声明(可以是必选，也可以是可选)
//必选不能设置默认值
<--o, option> string 描述文本

//可选option声明的默认值可以省略，类型和默认值也可以省略
【--o, option] 描述文本

```