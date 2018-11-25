{
  let view = {//添加audio标签与播放暂停按钮
    el:'#app',
    template:`
      <audio src={{url}}></audio>
      <div>
        <button class="play">播放音乐</button>
        <button class="pause">暂停音乐</button>
      </div>
    `,
    render(data){//接受到歌曲信息进行渲染
      $(this.el).html(this.template.replace('{{url}}',data.url))//将url置入audio标签
    },
    play(){//播放事件
      let audio = $(this.el).find('audio')[0]
      audio.play()
    },
    pause(){//暂停事件
      let audio = $(this.el).find('audio')[0]
      audio.pause()
    }
  }
  let model = {
    data:{
      id:'',
      name:'',
      singer:'',
      url:''
    },
    setId(id){
      this.data.id = id
    },
    get(){//从数据库中根据传来的id进行查询
      var query = new AV.Query('Song')
      return query.get(this.data.id).then((song)=>{//将获取到的数据song存入model中
        Object.assign(this.data,song.attributes)
        return song//返回获取到的数据
      })
    }
  }
  let controller = {
    init(view, model) {
      this.view = view
      this.model = model
      let id = this.getSongId()//获取查询参数中的歌曲id
      this.model.setId(id)//将id存入model中
      this.model.get().then(()=>{//根据获取到的id查询歌曲信息，并将得到的信息存入model
        this.view.render(this.model.data)//接受歌曲信息，进行渲染
      })
      this.bindEvents()
    },
    bindEvents(){//绑定事件
      $(this.view.el).on('click','.play',()=>{//点击按钮播放音乐
        this.view.play()
      })
      $(this.view.el).on('click','.pause',()=>{//点击按钮暂停音乐
        this.view.pause()
      })
    },
    getSongId() {
      let search = window.location.search//获取查询参数
      if (search.indexOf('?') === 0) {//去除查询参数中的问号
        search = search.substring(1)
      }
      let array = search.split('&').filter(v => v)//以&分隔查询参数并存入数组
      let id = ''//准备好存放id的变量

      for (let i = 0; i < array.length; i++) {//遍历所有获得的查询参数
        let kv = array[i].split('=')//将形如“id=xxx”的字符串以等号分隔
        let key = kv[0]//key为“id”
        let value = kv[1]//value为"xxx"
        if (key === 'id') {//如果是我们需要的参数
          id = value//存入id
          break
        }
      }

      return id//返回id，此时id即为从查询参数中取出的值
    }
  }
  controller.init(view,model)
}
