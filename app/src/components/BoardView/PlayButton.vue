<style scoped>
  .round-button {
    display: block;

    width: 150px;
    height: 150px;

    border: 4px solid #f5f5f5;
    border-radius: 50%;

    color: #f5f5f5;

    text-align: center;
    text-decoration: none;

    background: radial-gradient(#969696, #4D4D4D);

    box-shadow: 0 0 3px gray;

    font-size: 20px;
    font-weight: bold;

    box-sizing: content-box;
    position: relative;
    overflow: hidden;
  }

  .round-button:hover {
    cursor: pointer;

    color: #E3E3E3;
    background: radial-gradient(#6E6E6E, #2E2E2E);
    border-color: #D9D9D9;
  }

  .round-button.has-sound {
    /* background: radial-gradient(#9D23A8, #38003D); */
    background: radial-gradient(#09ED33, #0D8523);
  }

  .round-button.has-sound:hover {
    /* background: radial-gradient(#831D8C, #260029); */
    background: radial-gradient(#1DA836, #0B4015);
  }

  .round-button.is-playing {
    background: radial-gradient(#E32424, #610606);
  }

  .round-button.is-playing:hover {
    background: radial-gradient(#991414, #520B0B);
  }

  .round-button:active {
    cursor: pointer;
  }

  .round-button img {
    border-radius: 50%;

    width: 100%;
    height: 100%;

    opacity: 0.5;

    z-index: 1;
  }

  .button-contents {
    border-radius: 50%;

    width: 90%;
    height: 90%;
    margin: 5%;

    z-index: 2;

    position: absolute;
    top: 0;
    left: 0;
  }
  
  .button-center-container {
    border-radius: 50%;

    width: 100%;
    height: 100%;

    display: flex;
    align-items: center;
    justify-content: center;
  }

  .button-text {
    border-radius: 50%;

    margin: 10px;
  }

  /* For unknown reasons, these styles don't work
  .button-held-overlay {
    position: absolute;

    top: 0;
    left: 0;

    width: 0px;
    height: 0px;

    z-index: 10;

    border-radius: 50%;

    background: radial-gradient(#00BFFF, #043E52);
    opacity: 0.25;
  }

  .button-held-overlay:hover {
    cursor: pointer;
  }

  .button-held-overlay:active {
    cursor: pointer;
  }*/
</style>

<template>
  <a href="#" class="round-button is-unselectable" :class="{ 'has-sound': sound !== null && !isPlaying, 'is-playing': isPlaying }" v-on:mousedown="mouseDown" v-on:mouseup="mouseUp", v-on:mouseout="mouseOut" ondragstart="return false">
    <img :src="image" v-if="image">

    <div class="button-contents">
      <div class="button-center-container">
        <div class="button-text">
          {{ text }}
        </div>
      </div>
    </div>
  </a>

</template>

<script>
  function playSound(caller) {
    caller.$dispatch('playSound', { index: caller.index, path: caller.sound })
  }

  function stopSound(caller) {
    caller.$dispatch('stopSound')
  }
  
  function showSoundModal(caller) {
    caller.$dispatch('showModal', { soundIndex: caller.index, soundTitle: caller.text, imagePath: caller.image, soundPath: caller.sound })
  }

  export default {
    props: {
      index: {
        type: Number,
        required: true
      },
      text: {
        type: String,
        default: 'Default'
      },
      image: {
        type: String
      },
      sound: {
        type: String
      },
      isPlaying: {
        type: Boolean,
        default: false
      }
    },

    data: function () {
      return {
      }
    },

    methods: {
      mouseDown: function (event) {
        this.progress = 0
        this.button = event.currentTarget

        this.progressOverlay = document.createElement('div')
        // setting the class dynamically won't work for some reason
        this.progressOverlay.className = 'button-held-overlay'
        
        this.progressOverlay.style.position = 'absolute'
        this.progressOverlay.style.top = 0
        this.progressOverlay.style.left = 0
        this.progressOverlay.style.zindex = 10
        this.progressOverlay.style.opacity = 0.6
        this.progressOverlay.style.width = 0
        this.progressOverlay.style.height = 0
        this.progressOverlay.style.borderRadius = '50%'
        this.progressOverlay.style.background = 'radial-gradient(#B1BF13, #575E0A)'
        this.progressOverlay.style.cursor = 'pointer'
        
        this.button.appendChild(this.progressOverlay)

        const holdDelay = 250
        const updateTiming = 1000 * 0.05
        const updateProgressCircle = function () {
          this.progress += 0.05

          var adjustedSize = (150 * this.progress)
          var pos = 150 / 2 - adjustedSize / 2

          this.progressOverlay.style.top = pos + 'px'
          this.progressOverlay.style.left = pos + 'px'
          
          this.progressOverlay.style.width = adjustedSize + 'px'
          this.progressOverlay.style.height = adjustedSize + 'px'
          
          if (this.progress < 1.0) {
            this.nextUpdate = setTimeout(updateProgressCircle, updateTiming)
          }
        }.bind(this)

        this.nextUpdate = setTimeout(updateProgressCircle, holdDelay + updateTiming)
      },

      mouseUp: function () {
        if (this.sound === null || this.progress >= 1.0) {
          showSoundModal(this)
        }
        else if (this.isPlaying) {
          stopSound(this)
        }
        else if (this.sound) {
          playSound(this)
        }
        
        if (this.nextUpdate) {
          clearTimeout(this.nextUpdate)
        }
        
        if (this.progressOverlay) {
          this.button.removeChild(this.progressOverlay)
          this.progressOverlay = null
        }
      },

      mouseOut: function (event) {
        // this is the original element the event handler was assigned to
        var e = event.relatedTarget || event.toElement
        var self = event.currentTarget

        // check for all children levels (checking from bottom up)
        while (e && e.parentNode && e.parentNode !== window) {
          if (e.parentNode === self || e === self) {
            if (e.preventDefault) {
              e.preventDefault()
            }
            
            return false
          }

          e = e.parentNode
        }

        if (this.nextUpdate) {
          clearTimeout(this.nextUpdate)
        }

        if (this.progressOverlay) {
          this.button.removeChild(this.progressOverlay)
          this.progressOverlay = null
        }
      }
    },

    name: 'play-button'
  }
</script>
