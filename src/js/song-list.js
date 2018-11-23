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
      console.log(songs)
      let liList = songs.map((song) => $('<li></li>').text(song.name))//遍历songs，创建li标签
      console.log(liList)
      $el.find('ul').empty()//清空原来的ul

      liList.map((domLi) => {//将li标签设为ul的子元素
        $el.find('ul').append(domLi)
      })
      console.log($el.find('ul'))
    },
    clearActive() {
      $(this.el).find('.active').removeClass('active')
    }
  }
  let model = {
    data: {
      songs: []
    },
    find() {//查询
      var query = new AV.Query('Song');//查询数据库中已有的数据
      return query.find().then((songs) => {//将查询到的结果遍历
        this.data.songs = songs.map((song)=>{//将结果推入songs中
          return {id:song.id,...song.attributes}
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
      window.eventHub.on('upload', () => {
        this.view.clearActive()
      })
      window.eventHub.on('create', (songData) => {//监听到歌曲创建
        this.model.data.songs.push(songData)//将数据推入model
        this.view.render(this.model.data)
      })
      this.model.find().then(() => {//每次初始化时都重新从数据库中读取数据并渲染页面
        this.view.render(this.model.data)
      })

    }
  }
  controller.init(view, model)
}