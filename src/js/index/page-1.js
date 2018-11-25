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
    },
    bindEventHub() {//监听selectTab事件，根据传来的参数判断是否展示该标签
      window.eventHub.on('selectTab', (tabName) => {
        if (tabName === 'page-1') {
          this.view.show()
        } else {
          this.view.hide()
        }
      })
    }
  }
  controller.init(view, model)
}