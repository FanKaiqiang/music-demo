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
      <div class="row">
        <label>封面</label>
        <input name="cover" type="text" value="__cover__">
      </div>
      <div class="row actions">
        <button type="submit">保存</button>
      </div>
    </form>
    `,//容器内容
    render(data = {}) {//把容器内容放入页面的方法
      let placeholders = ['name', 'url', 'singer', 'id','cover']//声明占位符数组
      let html = this.template
      placeholders.map((string) => {//遍历数组，将获得的data替换占位符
        html = html.replace(`__${string}__`, data[string] || '')
      })
      $(this.el).html(html)//渲染页面
      if (data.id || data.id === {}) {//如果当前data.id存在（即li标签有对应的歌曲）
        $(this.el).prepend('<h1>编辑歌曲</h1>')
      } else {
        $(this.el).prepend('<h1>新建歌曲</h1>')
      }
    },
    reset() {
      this.render({})
    }
  }
  let model = {
    data: {
      name: '', singer: '', url: '', id: '',cover:''
    },
    update(data) {//更新数据
      // 第一个参数是 className，第二个参数是 objectId
      var song = AV.Object.createWithoutData('Song', this.data.id);
      // 修改属性
      song.set('name', data.name);
      song.set('singer', data.singer);
      song.set('url', data.url);
      song.set('cover', data.cover);
      // 保存到云端
      return song.save().then((response) => {//将model中的data修改为更新后的data
        Object.assign(this.data, data)
        return response
      });
    },
    create(data) {//增加数据
      // 声明类型
      var Song = AV.Object.extend('Song');
      // 新建对象
      var song = new Song();
      // 设置名称
      song.set('name', data.name);
      song.set('singer', data.singer);
      song.set('url', data.url);
      song.set('cover', data.cover);
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
      this.view.render(this.model.data)
      this.bindEvents()
      window.eventHub.on('select', (data) => {//监听歌单选择事件
        this.model.data = data//将得到的data置于model
        this.view.render(this.model.data)//渲染页面 
      })
      window.eventHub.on('new', (data) => {//监听new事件（即上传文件或点击新建歌曲）
        this.model.data = {}//置空表单
        if (data) {//如果不点击新建歌曲就直接上传文件
          Object.assign(this.model.data, data)//填入数据
          this.model.data.id = ''//因为是新建歌曲所以将当前的当前id置空
        }
        this.view.render(this.model.data)//渲染页面
      })
    },
    create() {//创建
      let needs = 'name singer url'.split(' ')//生成['name','singer','url']数组
      let data = {}
      needs.map((string) => {//遍历needs，将页面中input填入的值放入data
        data[string] = this.view.$el.find(`input[name=${string}]`).val()
      })
      this.model.create(data).then(() => {//一旦创建新的data，就渲染到页面里
        this.view.reset()
        window.eventHub.emit('create', JSON.parse(JSON.stringify(this.model.data)))
      })
    },
    update() {//更新
      let needs = 'name singer url cover'.split(' ')//生成['name','singer','url']数组
      let data = {}
      needs.map((string) => {//遍历needs，将页面中input填入的值放入data
        data[string] = this.view.$el.find(`input[name=${string}]`).val()
      })
      this.model.update(data).then(() => {//发布update事件
        window.eventHub.emit('update', JSON.parse(JSON.stringify(this.model.data)))
      })
    },
    bindEvents() {
      this.view.$el.on('submit', 'form', (e) => {//监听$el中form的提交
        e.preventDefault()//禁止默认事件
        if (this.model.data.id) {//如果是编辑歌曲状态
          this.update()
        } else {//如果是新建歌曲状态
          this.create()
        }

      })//一开始form不在页面里，通过render渲染后才有form，因此要绑定$el
    }
  }
  controller.init(view, model)
}