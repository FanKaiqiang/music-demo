{//最新音乐模块
  let view = {
    el: 'section.songs',
    init() {
      this.$el = $(this.el)
    },
    render(data) {//将获取到的歌单数据渲染到页面中
      let songs = data//读取数据
      songs.map((song) => {//遍历数据
        let $li = $(`
        <li>
          <h3>${song.name}</h3>
            <p>
              <svg class="icon icon-sq">
                <use xlink:href="#icon-sq"></use>
              </svg>
              ${song.singer}
            </p>
          <a class="playButton" href="#">
            <svg class="icon icon-play">
              <use xlink:href="#icon-play"></use>
            </svg>
          </a>
        </li>
        `)//形成标签
        this.$el.find('ol.list').append($li)//填充标签
      })
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
      this.view.init()
      this.model = model
      this.model.find().then(() => {//获取数据后将数据进行渲染
        this.view.render(this.model.data.songs)
        console.log(this.model.data.songs)
      })
    }
  }
  controller.init(view, model)
}