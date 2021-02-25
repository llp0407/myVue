const compileUtil = {
    getVal(expr,vm){
        return expr.split('.').reduce((data,currentVal)=>{
            return data[currentVal];
        },vm.$data)
    },
    setVal(expr,vm,inputVal){
        let arr = expr.split('.')
        arr.reduce((data,currentVal,idx)=>{
            if(idx == arr.length-1){
                data[currentVal] = inputVal
            }
            return data[currentVal]
        },vm.$data)
    },
    getContentVal(expr,vm){
        value = expr.replace(/\{\{(.+?)\}\}/g,(...args)=>{
            return this.getVal(args[1],vm)
        })
        return value
    },
    text(node,expr,vm){
        //expr:msg  学习MVVM原理  // <div v-text="person.fav"></div>
        // const value = vm.$data[expr];
        let value;
        if(expr.indexOf('{{') !== -1){
            value = expr.replace(/\{\{(.+?)\}\}/g,(...args)=>{
                new Watcher(vm, args[1], (newVal)=>{
                    this.updater.textUpdater(node, this.getContentVal(expr,vm));
                })
                return this.getVal(args[1],vm)
            })
        }else{
            value = this.getVal(expr,vm)
            new Watcher(vm, expr, (newVal)=>{
                this.updater.textUpdater(node, this.getVal(expr,vm));
            })
        }
        this.updater.textUpdater(node,value)
    },
    html(node,expr,vm){
        let value =this.getVal(expr,vm)
        new Watcher(vm, expr, (newVal)=>{
            this.updater.htmlUpdater(node,newVal)
        })
        this.updater.htmlUpdater(node,value)
    },
    model(node,expr,vm){
        const value = this.getVal(expr,vm)
        // 绑定更新函数 数据=>视图
        new Watcher(vm, expr, (newVal)=>{
            this.updater.modelUpdater(node,newVal)
        })
        // 视图=>数据=>视图  双向绑定的实现
        node.addEventListener('input',(e)=>{
            // console.log(e)
            this.setVal(expr,vm,e.target.value)
        })
        this.updater.modelUpdater(node,value)
    },
    on(node,expr,vm,eventName){
        let fn = vm.$options.methods && vm.$options.methods[expr];
        node.addEventListener(eventName,fn.bind(vm),false)
    },
    // 更新的函数
    updater:{
        modelUpdater(node,value){
            node.value = value
        },
        htmlUpdater(node,value){
            node.innerHTML = value
        },
        textUpdater(node,value){
            node.textContent = value
        },
    }
}
class Compile{
    constructor(el,vm){
        this.el = this.isElementNode(el) ? el : document.querySelector(el);
        this.vm = vm;

        // 1.获取文档碎片对象  放入内存中会减少页面的回流和重绘
        const fragment = this.node2Fragment(this.el);

        // 2.编译模板
        this.compile(fragment)

        // 3.追加子元素到根元素
        this.el.appendChild(fragment);
    }
    compile(fragment){
        // 1.获取子节点
        const childNodes = fragment.childNodes;
        // console.log([...childNodes]);
        [...childNodes].forEach(child => {
            if(this.isElementNode(child)){
                // 是元素节点 编译元素节点
                // console.log('元素节点',child);
                this.compileElement(child);

            }else{
                // 文本节点 编译文本节点
                // console.log('文本节点',child);
                this.compileText(child)
            }
            // 当前child是最外层的 里面可能还有子节点 需要递归遍历
            if(child.childNodes && child.childNodes.length){
                this.compile(child);
            }
        })
        
    }
    compileElement(node){
        const attribtues = node.attributes;
        // console.log(attribtues);
        [...attribtues].forEach(attr=>{
            const {name,value} = attr
            // name:v-text  value:msg
            // console.log({name,value})
            // console.log(this.isDirective(name))
            if(this.isDirective(name)){
                // 进来这里代表是一个指令 v-text v-html v-model v-on:click...
                const [,dirctive] = name.split('-'); //text  html  model  on:click
                const [dirName,eventName] = dirctive.split(':');
                
                // 更新数据 数据驱动视图
                compileUtil[dirName](node,value,this.vm,eventName)
                // console.log(dirName,eventName)

                // 删除有指令的标签上的属性
                node.removeAttribute('v-'+ dirctive);
            }else if(this.isEventName(name)){
                //@click = handClick 
                let [,eventName] = name.split('@')
                compileUtil['on'](node,value,this.vm,eventName);
            }
        })
    }
    compileText(node){
        const content = node.textContent;
        if(/\{\{(.+?)\}\}/.test(content)){
            // console.log(content);
            compileUtil['text'](node,content,this.vm)
        }
    }
    isEventName(attrName){
        return attrName.startsWith('@')
    }
    isDirective(attrName){
        return attrName.startsWith('v-')
    }
    node2Fragment(el){
        // 创建文档碎片
        const f = document.createDocumentFragment();
        let firstChild;
        while(firstChild = el.firstChild){
            f.appendChild(firstChild)
        }
        return f
    }
    isElementNode(node){
        return node.nodeType === 1;
    }
}

class MVue{
    constructor(options){
        this.$el = options.el;
        this.$data = options.data;
        this.$options = options;
        if(this.$el){
            //1.实现一个数据观察者
            new Observer(this.$data)
            //2.实现一个指令解析器
            new Compile(this.$el,this)
            this.proxyData(this.$data);
        }
    }
    proxyData(data){
        for(const key in data){
            Object.defineProperty(this,key,{
                get(){
                    return data[key]
                },
                set(newVal){
                    data[key] = newVal
                }
            })
        }
    }
}