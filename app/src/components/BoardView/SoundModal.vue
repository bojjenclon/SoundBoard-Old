<style scoped>
  .sound-title label {
    display: inline-block;
    width: 140px;
    text-align: right;
  }
  
  .sound-title input {
    display: inline-block;
    width: 50%;
    margin-left: 25px;
  }

  .body-content {
    text-align: left;
  }

  .footer-content {
    width: 100%;
    margin: 0 auto;
  }
</style>

<template>

  <div class="modal is-active" v-on:keyup.enter="saveAndClose" v-on:keyup.esc="closeModal">

    <div class="modal-background" v-on:click.self="closeModal"></div>

    <div class="modal-card">

      <header class="modal-card-head">
        <p class="modal-card-title sound-title">
          Currently Editing: <strong>{{ options.soundTitle }}</strong>
        </p>

        <button class="delete" v-on:click.stop="closeModal"></button>
      </header>
      
      <section class="modal-card-body">

        <div class="body-content">

          <label class="label">Title</label>
          <p class="control has-icon">
            <input id="soundTitleInput" class="input is-primary" type="text" placeholder="Sound Title" value="{{ options.soundTitle }}">
            <i class="fa fa-music"></i>
          </p>

          <label class="label">Sound File</label>
          <div class="control is-grouped">

            <p class="control has-icon is-expanded">
              <input id="soundPathInput" class="input is-info is-disabled" type="text" placeholder="Path" value="{{ options.soundPath }}">
              <i class="fa fa-folder-open"></i>
            </p>

            <p class="control">
              <a class="button is-info" v-on:click="chooseSoundFile">
                Browse
              </a>
            </p>

            <p class="control">
              <a class="button is-danger" v-on:click="clearSoundPath">
                Clear
              </a>
            </p>

          </div>

          <label class="label">Image File (optional)</label>
          <div class="control is-grouped">

            <p class="control has-icon is-expanded">
              <input id="imagePathInput" class="input is-info is-disabled" type="text" placeholder="Path" value="{{ options.imagePath }}">
              <i class="fa fa-folder-open"></i>
            </p>

            <p class="control">
              <a class="button is-info" v-on:click="chooseImageFile">
                Browse
              </a>
            </p>

            <p class="control">
              <a class="button is-danger" v-on:click="clearImagePath">
                Clear
              </a>
            </p>

          </div>

      </section>

      <footer class="modal-card-foot">
        <div class="footer-content">
          <a class="button is-primary" v-on:click.stop="saveAndClose">Save changes</a>
          <a class="button is-danger" v-on:click.stop="resetButton">Reset</a>
          <a class="button" v-on:click.stop="closeModal">Cancel</a>
        </div>
      </footer>

    </div>

  </div>

</template>

<script>
  const {dialog} = require('electron').remote

  export default {
    props: {
      options: {}
    },

    methods: {
      chooseSoundFile: function () {
        var path = dialog.showOpenDialog({
          properties: ['openFile'],
          filters: [
            { name: 'Audio', extensions: ['mp3', 'ogg', 'wav'] },
            { name: 'All Files', extensions: ['*'] }
          ],
          defaultPath: document.getElementById('soundPathInput').value
        })

        if (path) {
          document.getElementById('soundPathInput').setAttribute('value', path)
        }
      },

      clearSoundPath: function () {
        document.getElementById('soundPathInput').setAttribute('value', '')
      },

      chooseImageFile: function () {
        var path = dialog.showOpenDialog({
          properties: ['openFile'],
          filters: [
            { name: 'Images', extensions: ['jpg', 'png', 'gif'] },
            { name: 'All Files', extensions: ['*'] }
          ],
          defaultPath: document.getElementById('imagePathInput').value
        })
        
        if (path) {
          document.getElementById('imagePathInput').setAttribute('value', path)
        }
      },

      clearImagePath: function () {
        document.getElementById('imagePathInput').setAttribute('value', '')
      },

      resetButton: function () {
        var soundOptions = {
          index: this.options.soundIndex,
          title: 'Not Assigned (#' + this.options.trueIndex + ')',
          image: null,
          sound: null
        }
        
        this.$dispatch('modifySoundOptions', soundOptions)
        this.$dispatch('saveData')
        this.$dispatch('closeModal')
      },

      closeModal: function () {
        this.$dispatch('closeModal', { index: -1 })
      },

      saveAndClose: function () {
        var soundOptions = {
          index: this.options.soundIndex,
          title: document.getElementById('soundTitleInput').value,
          image: document.getElementById('imagePathInput').value,
          sound: document.getElementById('soundPathInput').value
        }

        if (soundOptions.title === '') {
          soundOptions.title = null
        }

        if (soundOptions.image === '') {
          soundOptions.image = null
        }
        if (soundOptions.sound === '') {
          soundOptions.sound = null
        }

        this.$dispatch('modifySoundOptions', soundOptions)
        this.$dispatch('saveData')
        this.$dispatch('closeModal')
      }
    },

    name: 'sound-modal'
  }
</script>