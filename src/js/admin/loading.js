{
  let view = {//进度界面
    el:'#sideLoading',
    show(){//显示
      $(this.el).addClass('active')
    },
    hide(){//隐藏
      $(this.el).removeClass('active')
    }
  }
  let controller ={
    init(view){
      this.view = view
      this.bindEventHub()
    },
    bindEventHub(){//接受事件
      window.eventHub.on('beforeUpload',()=>{
        this.view.show()
      })
      window.eventHub.on('afterUpload',()=>{
        this.view.hide()
      })
    }
  }
  controller.init(view)
}