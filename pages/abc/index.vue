<script>
export default {
  name: 'AbecedaryPage',
  data() {
    return {
      alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
      colors: ['#EF4444', '#10B981', '#3B82F6', '#8B4513'],
      currentIndex: -1,
      isPlaying: false,
      intervalId: null,
      countdown: 0,
      countdownIntervalId: null
    }
  },
  methods: {
    togglePlay() {
      if(this.isPlaying) {
        clearInterval(this.intervalId)
        if(this.countdownIntervalId) clearInterval(this.countdownIntervalId)
        this.isPlaying = false
        this.countdown = 0
      } else {
        this.isPlaying = true

        // Reset if we are already at the end
        if(this.currentIndex >= this.alphabet.length - 1) {
          this.currentIndex = -1
        }

        // Start countdown if starting from beginning
        if(this.currentIndex === -1) {
          this.countdown = 3
          this.countdownIntervalId = setInterval(() => {
            this.countdown--
            if(this.countdown === 0) {
              clearInterval(this.countdownIntervalId)
              this.startAlphabet()
            }
          }, 1000)
        } else {
          this.startAlphabet()
        }
      }
    },
    startAlphabet() {
      // Highlight the first letter immediately if starting from the beginning
      if(this.currentIndex === -1) {
        this.currentIndex = 0
      }

      this.intervalId = setInterval(() => {
        if(this.currentIndex >= this.alphabet.length - 1) {
          clearInterval(this.intervalId)
          this.isPlaying = false
          return
        }
        this.currentIndex++
      }, 700)
    },
    getLetterStyle(index) {
      if(index <= this.currentIndex) {
        return {
          fontWeight: 'bold',
          color: this.colors[index % this.colors.length],
          transform: 'scale(1.15)',
          opacity: 1
        }
      }
      return { opacity: 0.4 }
    }
  },
  beforeDestroy() {
    if(this.intervalId) clearInterval(this.intervalId)
    if(this.countdownIntervalId) clearInterval(this.countdownIntervalId)
  }
}
</script>

<template>
  <div class="abc-container">
    <div class="card">
      <h1 class="title">The Abecedary</h1>

      <div class="alphabet-display" v-if="countdown === 0">
        <span v-for="(letter, index) in alphabet" :key="index" class="letter" :style="getLetterStyle(index)">
          {{ letter }}
        </span>
      </div>
      
      <div class="countdown-display" v-else>
        {{ countdown }}
      </div>

      <button @click="togglePlay" class="play-button" :class="{ 'playing': isPlaying }">
        {{ isPlaying ? 'Pause' : 'Play' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.abc-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  padding: 20px;
}

.card {
  background: white;
  border-radius: 24px;
  padding: 3rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 900px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 2.5rem;
  background: linear-gradient(to right, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  color: transparent;
  text-align: center;
}

.alphabet-display {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 0.5rem;
  justify-items: center;
  margin-bottom: 3.5rem;
  min-height: 200px;
  align-content: flex-start;
  width: 100%;
}

.letter {
  font-size: 3.5rem;
  font-weight: 400;
  color: #000;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-block;
  text-align: center;
}

.play-button {
  padding: 1rem 3.5rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  background-color: #3b82f6;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.play-button:hover {
  background-color: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.5);
}

.play-button:active {
  transform: translateY(0);
}

.play-button.playing {
  background-color: #f59e0b;
  box-shadow: 0 4px 6px -1px rgba(245, 158, 11, 0.5);
}

.play-button.playing:hover {
  background-color: #d97706;
  box-shadow: 0 10px 15px -3px rgba(245, 158, 11, 0.5);
}

.countdown-display {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 8rem;
  font-weight: 800;
  color: #3b82f6;
  min-height: 200px;
  margin-bottom: 3.5rem;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}
</style>
