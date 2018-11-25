{
  let view = {
    el: '.page-1',
    init() {
      this.$el = $(this.el)
    },
    show() {//展示
      this.$el.addClass('active')
    },
    hide() {//隐藏
      this.$el.removeClass('active')
    }
  }
  let model = {

  }
  let controller = {
    init(view, model) {
      this.view = view
      this.view.init()
      this.model = model
      this.bindEventHub()
      this.loadModules1()
      this.loadModules2()
    },
    bindEventHub() {//监听selectTab事件，根据传来的参数判断是否展示该标签
      window.eventHub.on('selectTab', (tabName) => {
        if (tabName === 'page-1') {
          this.view.show()
        } else {
          this.view.hide()
        }
      })
    },
    loadModules1(){//读取模块一「推荐歌单」，将模块script标签插入到页面中
      let script1 = document.createElement('script')
      script1.src = './js/index/page-1-1.js'
      script1.onload = ()=>{
        console.log('1加载完毕')
      }
      document.body.appendChild(script1)
    },
    loadModules2(){//读取模块二「最新音乐」，将模块script标签插入到页面中
      let script2 = document.createElement('script')
      script2.src = './js/index/page-1-2.js'
      script2.onload = ()=>{
        console.log('2加载完毕')
      }
      document.body.appendChild(script2)
    }
  }
  controller.init(view, model)
}