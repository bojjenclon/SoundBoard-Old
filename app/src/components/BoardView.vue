<style scoped>

</style>

<template>

  <section class="hero is-primary is-fullheight">

    <div class="hero-head">
      
      <header class="nav">

        <div class="container">

          <div class="nav-left">
            <a class="nav-item is-brand" href="#">
              <img src="assets/logo.png" alt="SoundBoard">
            </a>
          </div>

          <div class="nav-right nav-menu">
            <span class="nav-item">
              <a class="button" v-on:click="openExternalLink('https://github.com/bojjenclon/SoundBoard')" href="#">
                <span class="icon">
                  <i class="fa fa-github"></i>
                </span>
                <span>View Source</span>
              </a>
            </span>
          </div>

        </div>

      </header>
      
    </div>

    <div class="hero-body" v-on:mousewheel="mouseWheel">

      <div class="container has-text-centered">

        <!-- if buttons have finished loading, display them -->
        <div v-if="buttons">

          <div class="columns">
            <template v-for="style in buttonStyles.top">
              <div class="column">
                <div :style="style">
                  <play-button :text="buttons[currentPage][$index].title" :image="buttons[currentPage][$index].image" :sound="buttons[currentPage][$index].sound" :is-playing="buttons[currentPage][$index].isPlaying" :index="$index"></play-button>
                </div>
              </div>
            </template>
          </div>

          <div class="columns">
            <template v-for="style in buttonStyles.bottom">
              <div class="column">
                <div :style="style">
                  <play-button :text="buttons[currentPage][$index + buttonStyles.top.length].title" :image="buttons[currentPage][$index + buttonStyles.top.length].image" :sound="buttons[currentPage][$index + buttonStyles.top.length].sound" :is-playing="buttons[currentPage][$index + buttonStyles.top.length].isPlaying" :index="$index + buttonStyles.top.length"></play-button>
                </div>
              </div>
            </template>
          </div>
        
        </div>

        <!-- otherwise, display loading message -->
        <div v-else>
          <p>Loading, please wait...</p>
        </div>

      </div>

    </div>

    <div class="hero-foot">
      
        <nav class="pagination">

          <a class="button" :class="{ 'is-disabled': currentPage === 0 }" v-on:click="changePage(currentPage - 1)">Previous</a>
          <a class="button" :class="{ 'is-disabled': currentPage === totalPages - 1 }" v-on:click="changePage(currentPage + 1)">Next</a>

          <ul>
            <li v-for="i in totalPages">
              <a class="button" :class="{ 'is-success': currentPage == i }" v-on:click="changePage(i)">{{ i + 1 }}</a>
            </li>
          </ul>
          
        </nav>
      
    </div>
  
  </section>

  <sound-modal v-if="showModal" :options="modalOptions"></sound-modal>

</template>

<script>
  import PlayButton from './BoardView/PlayButton'
  import SoundModal from './BoardView/SoundModal'

  const {shell} = require('electron')
  const fs = require('fs')
  const storage = require('electron-json-storage')
  const howler = require('howler')

  var playingSound = null
  var soundCache = {}

  function fileExists(filePath) {
    try {
      return fs.statSync(filePath).isFile()
    }
    catch (error) {
      return false
    }
  }

  function validateData(data) {
    for (var i = 0; i < data.length; i++) {
      var page = data[i]

      for (var j = 0; j < page.length; j++) {
        var button = page[j]

        if (!fileExists(button.image)) {
          button.image = null
        }

        if (!fileExists(button.sound)) {
          button.sound = null
        }
      }
    }

    return data
  }

  function changePage(options) {
    if (options.pageIndex < 0 || options.pageIndex >= options.caller.totalPages) {
      return
    }

    options.caller.currentPage = options.pageIndex
  }

  function playSound(options) {
    stopSound(options.caller)

    if (options.path in soundCache) {
      playSoundHelper(options)
    }
    else if (fileExists(options.path)) {
      var howl = new howler.Howl({
        src: [options.path],
        onloaderror: function (id, error) {
          console.log('Howler failed with error code: ' + error)
        }
      })

      soundCache[options.path] = howl

      playSoundHelper(options)
    }
    else {
      console.log('The file at "' + options.path + '" does not exist.')
    }
  }

  function playSoundHelper(options) {
    playingSound = {
      buttonIndex: options.index,
      howl: soundCache[options.path]
    }

    const buttonIndex = options.index
    
    options.caller.buttons[options.caller.currentPage][buttonIndex].isPlaying = true
    playingSound.howl.play()

    playingSound.howl.on('end', function () {
      options.caller.buttons[options.caller.currentPage][buttonIndex].isPlaying = false
      playingSound = null
    })
  }

  function stopSound(caller) {
    if (playingSound) {
      caller.buttons[caller.currentPage][playingSound.buttonIndex].isPlaying = false
      
      playingSound.howl.stop()
      playingSound = null
    }
  }

  function removeFromSoundCache(songPath) {
    delete soundCache[songPath]
  }

  function saveData(caller) {
    storage.set('buttons', caller.buttons, function (error) {
      if (error) {
        throw error
      }
    })
  }

  const numButtons = 10
  const numPages = 10

  export default {
    data() {
      return {
        currentPage: 0,
        totalPages: numPages,

        showModal: false,

        buttons: null,

        buttonStyles: {
          top: [
            {
              'margin-top': '100px'
            },
            {
              'margin-top': '50px'
            },
            {},
            {
              'margin-top': '50px'
            },
            {
              'margin-top': '100px'
            }
          ],

          bottom: [
            {},
            {
              'margin-top': '50px'
            },
            {
              'margin-top': '100px'
            },
            {
              'margin-top': '50px'
            },
            {}
          ]
        }
      }
    },

    route: {
      data(transition) {
        storage.has('buttons', function (error, hasKey) {
          if (error) {
            throw error
          }
          
          if (hasKey) {
            storage.get('buttons', function (error, data) {
              if (error) {
                throw error
              }
              
              transition.next({ buttons: validateData(data) })
            })
          }
          else {
            var defaultButtons = []

            for (var i = 0; i < numPages; i++) {
              var page = []

              for (var j = 0; j < numButtons; j++) {
                var buttonIndex = (i * numButtons) + j + 1
                page.push({ title: 'Not Assigned (#' + buttonIndex + ')', image: null, sound: null, isPlaying: false })
              }

              defaultButtons.push(page)
            }

            transition.next({ buttons: defaultButtons })
          }
        })
      }
    },

    events: {
      'modifySoundOptions': function (options) {
        if (this.buttons[this.currentPage][options.index].sound !== null && options.sound === null) {
          removeFromSoundCache(this.buttons[this.currentPage][options.index].sound)
        }

        if (options.title !== null) {
          this.buttons[this.currentPage][options.index].title = options.title
        }
        
        this.buttons[this.currentPage][options.index].image = options.image
        this.buttons[this.currentPage][options.index].sound = options.sound
      },

      'playSound': function (options) {
        options.caller = this
        playSound(options)
      },

      'stopSound': function (options) {
        stopSound(this)
      },

      'showModal': function (options) {
        this.showModal = true
        this.modalOptions = options

        // the actual index of the button, relative to its page
        this.modalOptions.trueIndex = this.modalOptions.soundIndex + (this.currentPage * numPages) + 1

        stopSound(this)
      },
      
      'closeModal': function () {
        this.showModal = false
      },

      'saveData': function () {
        saveData(this)
      }
    },

    methods: {
      'openExternalLink': function (url) {
        shell.openExternal(url)
      },

      'mouseWheel': function (event) {
        var e = window.event || event
        var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)))

        changePage({ caller: this, pageIndex: this.currentPage + delta })
      },

      'changePage': function (pageIndex) {
        changePage({ caller: this, pageIndex: pageIndex })
      },

      'playSound': function (options) {
        options.caller = this
        playSound(options)
      },
      
      'stopSound': function (options) {
        stopSound(this)
      }
    },

    components: {
      PlayButton,
      SoundModal
    },

    name: 'board-view'
  }
</script>
