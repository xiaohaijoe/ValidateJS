# TimelineValidate
TimelineValidate是一个基于node.js数据验证器，提供了丰富的类型校验，只需简单的几行，就可以完成数据校验<br>
不管是node.js后台开发，还是web前端开发，都可以使用该验证器进行数据校验。

## 主要特性：
1. 提供丰富的验证规则
2. 可自定义规则
3. 提供静态调用方法

## 使用方法：
1. cnpm install
2. npm run dev

## 说明文档
https://github.com/xiaohaijoe/TimelineValidate/wiki/TimelineValidate-Document

## 基本使用
```
let rule =[
  ['name', 'require|max:25'],
  ['email', 'email']
]
let validate = new Validate(rule);
let data = {
    'name': 'hello world',
    'email': 'hijack@xiaohaijoe.com'
}
if (!validate.check(data)) {
    console.log(validate.getError());
}
```

更多介绍请查看说明文档。
