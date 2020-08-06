# 参数声明模板语法一览
不符合下列的都为错误语法

```
# 必选参数
<-p, property> type `summary`

# 可选参数
[-p, property] `summary`

# 可选参数（带类型, 类型可选string和number）
[-p, property] string `summary`

# 可选参数（带默认值）
[-p, property] string value `summary`

```

## 模板语法大白话解释：  

```js
//语法基本格式为四部分
 [-n ,name]  string  王德发 `姓名`
     ^         ^       ^     ^
   参数指定    类型    默认值  介绍

//参数指定部分分为命令行接参符号和参数key名
 [-n,            name]  ...
   ^               ^
 命令行接参符号    参数key，会出现在你的params里边为key


//使用尖括号代表该参数是必选参数，命令行使用的时候不指定该参数就会报错，必选参数不能指定默认值，且不可省略类型声明
 <-n, name> string `姓名`
 ^        ^
 
//方括号代表可选参数，可以指定类型，也可以指定默认值，指定默认值前面必须指定类型；也可以类型默认值都省略；对了，只有可选参数才可以指定默认值
 [-n, name]       string           王德发   `用户名`
                    ^                ^
               类型string或number    默认值     

//参数绍部分不能省略，且只能用反引号括起来。
[-n, name] string 王德发   `我就是参数介绍`
                               ^
                        这就是参数介绍，不可省略
```
