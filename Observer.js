class Watcher{
    constructor(vm,expr,cb){
        this.vm = vm;
        this.expr = expr;
        this.cb = cb;
        // 先把旧值保存起来
        this.oldVal = this.getOldVal()
    }
    getOldVal(){
        Dep.target = this;
        const oldVal = compileUtil.getVal(this.expr,this.vm);
        Dep.target = null;
        return oldVal
    }
    update(){
        const newVal = compileUtil.getVal(this.expr,this.vm);
        if(newVal !== this.oldVal){
            this.cb(newVal)
        }
    }
}

class Dep{
    constructor(){
        this.subs = []
    }
    // 收集观察者
    addSub(watcher){
        this.subs.push(watcher)
    }
    // 通知观察者去更新
    notifuy(){
        console.log('通知了观察者',this.subs)
        this.subs.forEach(w=>w.update())
    }
}

class Observer {
    constructor(data) {
        this.observe(data);
    }
    observe(data) {
        /*
        {
            person:{
                name:"张三",
                fav:{
                    a:"爱好"
                }
            }
        }
        */
        if (data && typeof data === 'object') {
            // console.log(Object.keys(data))
            Object.keys(data).forEach(key=>{
                this.defineReactive(data,key,data[key])
            })
        }
    }
    defineReactive(obj,key,value){
        // 递归遍历
        this.observe(value)
        const dep = new Dep();
        Object.defineProperty(obj,key,{
            enumerable:true,
            configurable:false,
            get(){
                // 订阅数据取值编译时，往Dep中添加观察者
                Dep.target && dep.addSub(Dep.target)
                return value
            },
            set:(newVal)=>{
                //这一步是为了直接改变对象属性的时候也要监听
                this.observe(newVal);
                if(newVal !== value){
                    value = newVal
                }
                // 告诉Dep通知变化
                dep.notifuy();
            }
        })
    }
}