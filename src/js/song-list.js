{
  let view = {
    el: '#songList-container',
    template: `
      <ul class="songList">
      </ul>
    `,
    render(data) {
      let $el = $(this.el)//先把ul放到页面里去
      $el.html(this.template)
      let { songs } = data//将获取到的song推入data
      let liList = songs.map((song) => $('<li></li>').text(song.name).attr('data-id', song.id))//遍历songs，创建li标签
      $el.find('ul').empty()//清空原来的ul
      liList.map((domLi) => {//将li标签设为ul的子元素
        $el.find('ul').append(domLi)
      })
    },
    clearActive() {
      $(this.el).find('.active').removeClass('active')
    },
    activeItem(li) {//获取到点击的li标签
      let $li = $(li)
      $li.addClass('active')//添加active
        .siblings('.active').removeClass('active')//兄弟元素移除active
    }
  }
  let model = {
    data: {
      songs: []
    },
    find() {//查询
      var query = new AV.Query('Song');//查询数据库中已有的数据
      return query.find().then((songs) => {//将查询到的结果遍历
        this.data.songs = songs.map((song) => {//将结果推入songs中
          return { id: song.id, ...song.attributes }
        })
        return songs
      })
    }
  }
  let controller = {
    init(view, model) {
      this.view = view
      this.model = model
      this.view.render(this.model.data)
      this.bindEvents()
      this.bindEventHub()
      this.getAllSongs()
    },
    getAllSongs() {
      return this.model.find().then(() => {//每次初始化时都重新从数据库中读取数据并渲染页面
        this.view.render(this.model.data)
      })
    },
    bindEvents() {
      $(this.view.el).on('click', 'li', (e) => {//歌单绑定监听点击li事件
        this.view.activeItem(e.currentTarget)//获取点击元素
        let songId = e.currentTarget.getAttribute('data-id')//读取点击元素的data-id属性
        let data
        let songs = this.model.data.songs
        for (let i = 0; i < songs.length; i++) {//遍历songs
          if (songs[i].id === songId) {//看哪个song的id是songId
            data = songs[i]
            break
          }
        }//把用户点击的li对应的歌曲信息深拷贝，作为data发布
        window.eventHub.emit('select', JSON.parse(JSON.stringify(data)))//发布select事件
      })
    },
    bindEventHub() {
      window.eventHub.on('upload', () => {//绑定点击歌单事件
        this.view.clearActive()//点击触发active
      })
      window.eventHub.on('create', (songData) => {//监听到歌曲创建
        this.model.data.songs.push(songData)//将数据推入model
        this.view.render(this.model.data)
      })
    }
  }
  controller.init(view, model)
}