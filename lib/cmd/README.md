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