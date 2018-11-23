window.eventHub = {
  events: {// 所有发布的事件与订阅情况

  },
  emit(eventName,data){ //发布事件，传入发布的事件名与发布的事件data
    for(let key in this.events){//遍历event
      if(key === eventName){//如果key等于传入的事件名
        let fnList = this.events[key]//取出events[key]存放的该事件的订阅情况
        fnList.map((fn)=>{//遍历 events[key]
          fn.call(undefined,data)//给每个订阅了该事件的函数都调用一次data
        })
      }
    }
  },
  on(eventName,fn){//订阅事件
    if(this.events[eventName]===undefined){//如果是新发布的事件，就直接在events简历这个订阅数组
      this.events[eventName]=[]
    }
    this.events[eventName].push(fn)//将fn推入这个订阅数组
  }
}