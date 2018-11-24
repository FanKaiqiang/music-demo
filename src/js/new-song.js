{
  let view = {
    el: '.newSong',
    template: `
      新建歌曲
    `,
    render(data) {
      $(this.el).html(this.template)
    }
  }
  let model = {}
  let controller = {
    init(view, model) {
      this.view = view
      this.model = model
      this.view.render(this.model.data)
      this.active()
      window.eventHub.on('new', (data) => {//监听到new事件，给新建歌曲加高亮
        this.active()
      })
      window.eventHub.on('select', (data) => {//监听歌单选择事件
        console.log(data.id)
        this.deactive()//将新建歌曲栏取消高亮
      })
      $(this.view.el).on('click', () => {
        window.eventHub.emit('new')//每当点击“新建歌曲”就发布new事件
      })//监听点击事件，标签高亮
    },
    active() {//高亮标签
      $(this.view.el).addClass('active')
    },
    deactive() {//取消高亮
      $(this.view.el).removeClass('active')
    }
  }
  controller.init(view, model)
}