{
  let view = {
    el: '#tabs',
    init() {
      this.$el = $(this.el)
    }
  }
  let model = {

  }
  let controller = {
    init(view, model) {
      this.view = view
      this.view.init()
      this.model = model
      this.bindEvents()
    },
    bindEvents() {//监听点击时间
      this.view.$el.on('click', '.tabs-nav>li', (e) => {
        let $li = $(e.currentTarget)//获取点击标签
        let pageName = $li.attr('data-tab-name')//获取点击标签的data-tab-name属性

        $li.addClass('active')//激活相应li标签
          .siblings().removeClass('active')
        window.eventHub.emit('selectTab',pageName)//将data-tab-name属性作为参数，发布selectTab事件
      })
    }
  }
  controller.init(view, model)
}