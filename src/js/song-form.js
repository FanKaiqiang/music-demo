{
  let view = {
    el: '.page>main', //容器
    init() {
      this.$el = $(this.el)
    },
    template: `
    <form class="form">
      <div class="row">
        <label>歌名</label>
        <input name="name" type="text" value="__name__">
      </div>
      <div class="row">
        <label>歌手</label>
        <input name="singer" type="text" value="__singer__">
      </div>
      <div class="row">
        <label>外链</label>
        <input name="url" type="text" value="__url__">
      </div>
      <div class="row actions">
        <button type="submit">保存</button>
      </div>
    </form>
    `,//容器内容
    render(data = {}) {//把容器内容放入页面的方法
      let placeholders = ['name', 'url', 'singer', 'id']//声明占位符数组
      let html = this.template
      placeholders.map((string) => {//遍历数组，将获得的data替换占位符
        html = html.replace(`__${string}__`, data[string] || '')
      })
      $(this.el).html(html)//渲染页面
      if(data.id){//如果当前data.id存在（即li标签有对应的歌曲）
        $(this.el).prepend('<h1>编辑歌曲</h1>')
      }else{
        $(this.el).prepend('<h1>新建歌曲</h1>')
      }
    },
    reset() {
      this.render({})
    }
  }
  let model = {
    data: {
      name: '', singer: '', url: '', id: ''
    },
    create(data) {
      // 声明类型
      var Song = AV.Object.extend('Song');
      // 新建对象
      var song = new Song();
      // 设置名称
      song.set('name', data.name);
      song.set('singer', data.singer);
      song.set('url', data.url);
      return song.save().then((newSong) => {
        let { id, attributes } = newSong
        this.data = {//把所有id与attributes的值赋予data
          id,
          ...attributes
        }
      }, (error) => {
        console.error(error);
      });
    }
  }
  let controller = {
    init(view, model) {
      this.view = view
      this.view.init()
      this.model = model
      this.bindEvents()
      this.view.render(this.model.data)
      window.eventHub.on('upload', (data) => {//一旦获得新的data
        this.model.data = data
        this.view.render(this.model.data)//就将这个新的data渲染到页面中
      })
      window.eventHub.on('select',(data)=>{//订阅歌单选择事件
        this.model.data=data//将得到的data置于model
        this.view.render(this.model.data)//渲染页面 
      })
      window.eventHub.on('new',()=>{//订阅new事件
        this.model.data = {}//清空data
        this.view.render(this.model.data)//渲染页面
      })
    },
    bindEvents() {
      this.view.$el.on('submit', 'form', (e) => {//监听$el中form的提交
        e.preventDefault()//禁止默认事件
        let needs = 'name singer url'.split(' ')//生成['name','singer','url']数组
        let data = {}
        needs.map((string) => {//遍历needs，将页面中input填入的值放入data
          data[string] = this.view.$el.find(`input[name=${string}]`).val()
        })
        this.model.create(data).then(() => {//一旦创建新的data，就渲染到页面里
          this.view.reset()
          window.eventHub.emit('create', this.model.data)
        })
      })//一开始form不在页面里，通过render渲染后才有form，因此要绑定$el
    }
  }
  controller.init(view, model)
}