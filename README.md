# 简易版vue 

- [x] Observer 数据观察者
- [x] Compile 编译器
- [x] proxyData 代理data




# 0、流程图
<img src='https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fwww.codeprj.com%2Fimage%2FaHR0cHM6Ly9pbWcyMDIwLmNuYmxvZ3MuY29tL2Jsb2cvMTU0MDExOC8yMDIwMDQvMTU0MDExOC0yMDIwMDQxMDE3MzMzNjIwNC0yMTM5NzAxODEyLmpwZw%3D%3D.png&refer=http%3A%2F%2Fwww.codeprj.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1670912063&t=3985895c78a335f999b8aa201f66ae56'>


# 1、实现一个数据观察者

## (1) Object.defineProperty 数据劫持
## (2) Watcher添加更新方法
## (3) Dep依赖收集


# 2、实现一个指令解析器

## (1) 文档碎片
## (2) 解析编译dom节点

### 元素节点
- 解析指令
- 解析事件
### 文本节点
- 解析双括号{{}}，