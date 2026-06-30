<template>
  <div>
    <courses-header v-model="showContent" title="Práctico - Día 3" />

    <v-expand-transition>
      <div v-if="showContent" class="pa-4">

        <!-- SECCION 1: Explorador de Acordes Mayores -->
        <courses-section title="Explorador de Acordes Mayores" icon="mdi-guitar-pick-outline">
          <p class="text-body-2 grey--text text--darken-3 mb-4">
            Selecciona un acorde para ver su digitación (diagrama de diapasón), las notas que lo
            componen y escuchar cómo suena. Los números dentro de los círculos indican qué dedo de la
            mano izquierda debes usar.
          </p>

          <!-- Chord selector buttons -->
          <div class="d-flex flex-wrap justify-center mb-6" style="gap: 10px;">
            <v-btn v-for="(chord, index) in majorChords" :key="chord.name"
              :color="selectedChordIndex === index ? 'primary' : 'grey lighten-3'"
              :dark="selectedChordIndex === index" :outlined="selectedChordIndex !== index" class="font-weight-bold"
              rounded large @click="selectChord(index)">
              {{ chord.name }}
            </v-btn>
          </div>

          <v-row dense class="align-start">
            <!-- Column 1: Chord diagram -->
            <v-col cols="12" md="5" class="d-flex justify-center">
              <v-card outlined class="pa-4 w-100" max-width="320">
                <div class="text-center mb-3">
                  <span class="text-h4 font-weight-black primary--text">{{ selectedChord.name }}</span>
                  <span class="text-subtitle-1 grey--text text--darken-2 ml-2">({{ selectedChord.fullName
                  }})</span>
                </div>

                <div class="fretboard-container mx-auto" style="max-width: 240px; padding: 0 26px;">
                  <!-- Labels of strings at top -->
                  <div
                    class="d-flex justify-space-between mb-2 text-caption font-weight-black grey--text text--darken-3"
                    style="width: 100%;">
                    <div v-for="(str, idx) in ['4ª G', '3ª C', '2ª E', '1ª A']" :key="idx" class="text-center"
                      style="flex: 1;">
                      {{ str }}
                    </div>
                  </div>

                  <!-- Fretboard block -->
                  <div class="fretboard rounded-lg overflow-visible" style="
                      background: linear-gradient(180deg, #c8a97a 0%, #a07040 40%, #8b5e2a 100%);
                      border: 3px solid #5c3a10;
                      border-radius: 6px;
                      position: relative;
                      box-shadow: inset 0 0 18px rgba(0,0,0,0.45), 0 4px 12px rgba(0,0,0,0.2);
                    ">

                    <!-- Vertical string lines running full height -->
                    <div class="fretboard-strings"
                      style="position: absolute; top: 0; bottom: 0; left: 0; right: 0; display: flex; justify-content: space-around; pointer-events: none; z-index: 1;">
                      <div v-for="s in [4, 3, 2, 1]" :key="s" :style="{
                        width: getStringThickness(s) + 'px',
                        background: s === 3
                          ? 'linear-gradient(180deg, #d4d4d4 0%, #ffffff 30%, #c0c0c0 60%, #ffffff 100%)'
                          : s === 4
                            ? 'linear-gradient(180deg, #cccc88 0%, #ffffaa 30%, #b8b870 60%, #ffffcc 100%)'
                            : 'linear-gradient(180deg, #e0e0e0 0%, #ffffff 30%, #cccccc 60%, #ffffff 100%)',
                        boxShadow: '0 0 3px rgba(255,255,255,0.6), 0 0 6px rgba(0,0,0,0.4)',
                        borderRadius: '2px',
                      }"></div>
                    </div>

                    <!-- Open string row (above nut) -->
                    <div class="d-flex justify-space-around pb-2 pt-2" style="position: relative; z-index: 4;">
                      <div v-for="s in [4, 3, 2, 1]" :key="s" class="d-flex justify-center align-center"
                        style="flex: 1; height: 26px;">
                        <span v-if="getFretForString(s) === 0" class="font-weight-black"
                          style="color: rgba(255,255,255,0.85); font-size: 0.85rem;">○</span>
                      </div>
                    </div>

                    <!-- Nut (cejilla) -->
                    <div style="
                      height: 8px;
                      background: linear-gradient(180deg, #f5f0e8 0%, #ffffff 50%, #d8d0c0 100%);
                      border-top: 2px solid #aaa;
                      border-bottom: 2px solid #888;
                      box-shadow: 0 2px 4px rgba(0,0,0,0.5);
                      position: relative; z-index: 3;
                    "></div>

                    <!-- Frets 1 to 4 -->
                    <div v-for="f in [1, 2, 3, 4]" :key="f" style="position: relative;"
                      :style="{ borderBottom: f < 4 ? '3px solid #9a8060' : 'none', height: '54px' }">
                      <!-- Fret label on the left -->
                      <span class="text-caption font-weight-bold"
                        style="position: absolute; left: -26px; top: 50%; transform: translateY(-50%); color: #666; font-size: 0.6rem;">Tr.{{
                          f }}</span>

                      <!-- Note avatars per string, centered in each cell -->
                      <div class="d-flex justify-space-around fill-height align-center"
                        style="position: relative; z-index: 4;">
                        <div v-for="s in [4, 3, 2, 1]" :key="s" class="d-flex justify-center align-center"
                          style="flex: 1; height: 100%;">
                          <v-avatar v-if="getFretForString(s) === f" color="amber accent-4" size="26"
                            class="elevation-6 scale-up-pulse font-weight-black black--text"
                            style="z-index: 5; font-size: 0.72rem; border: 2px solid #fff;">
                            {{ getFingerForString(s) }}
                          </v-avatar>
                        </div>
                      </div>
                    </div>

                    <!-- Bottom border cosmetic -->
                    <div
                      style="height: 6px; background: linear-gradient(180deg, #5c3a10 0%, #3a2008 100%); border-radius: 0 0 4px 4px;">
                    </div>
                  </div>

                  <div class="text-center text-caption grey--text text--darken-2 mt-3">
                    <span class="white--text">○</span><span class="grey--text text--darken-1">
                      cuerda al aire</span> &nbsp;|&nbsp;
                    <span class="amber--text text--darken-3 font-weight-bold">●</span> dedo / traste
                  </div>
                </div>

                <div class="d-flex justify-center mt-4">
                  <v-btn color="primary" dark @click="playChord">
                    <v-icon left>mdi-play-circle</v-icon>
                    Reproducir Acorde
                  </v-btn>
                </div>
              </v-card>
            </v-col>

            <!-- Column 2: Chord details -->
            <v-col cols="12" md="7" class="pl-md-4 mt-4 mt-md-0">
              <v-card outlined class="pa-4 grey lighten-5"
                style="border-color: rgba(25, 118, 210, 0.25) !important;">
                <div class="text-subtitle-2 font-weight-bold grey--text text--darken-2 mb-3">
                  Notas que componen el acorde {{ selectedChord.name }} Mayor
                </div>

                <v-row dense class="mb-2">
                  <v-col v-for="(note, idx) in selectedChord.notes" :key="idx" cols="4">
                    <v-card outlined class="pa-3 text-center fill-height d-flex flex-column align-center"
                      style="cursor: pointer;" @click="playTone(note.frequency, 1.0)">
                      <v-chip x-small color="primary" outlined class="mb-2">
                        {{ note.degree }}
                      </v-chip>
                      <div class="text-h5 font-weight-bold primary--text">{{ note.latin }}</div>
                      <div class="text-caption grey--text text--darken-2">{{ note.english }}</div>
                      <v-icon small color="grey" class="mt-1">mdi-volume-high</v-icon>
                    </v-card>
                  </v-col>
                </v-row>

                <v-divider class="my-3" />

                <div class="text-caption grey--text text--darken-1 mb-2">
                  <v-icon x-small color="primary" class="mr-1">mdi-information-outline</v-icon>
                  Toca cada nota individualmente arriba, o usa "Reproducir Acorde" para escucharlas
                  juntas como tríada.
                </div>

                <v-divider class="my-3" />

                <div class="text-subtitle-2 font-weight-bold grey--text text--darken-2 mb-2">
                  Digitación por cuerda
                </div>
                <v-simple-table dense>
                  <template v-slot:default>
                    <thead>
                      <tr>
                        <th class="text-left">Cuerda</th>
                        <th class="text-left">Traste</th>
                        <th class="text-left">Dedo</th>
                        <th class="text-left">Nota</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(s, idx) in selectedChord.strings" :key="idx">
                        <td>{{ s.label }}</td>
                        <td>{{ s.fret === 0 ? 'Al aire' : s.fret }}</td>
                        <td>{{ s.fret === 0 ? '—' : fingerNames[s.finger] }}</td>
                        <td class="font-weight-bold primary--text">{{ s.note }}</td>
                      </tr>
                    </tbody>
                  </template>
                </v-simple-table>
              </v-card>
            </v-col>
          </v-row>
        </courses-section>

        <!-- SECCION 3: Ponte a Prueba -->
        <courses-section title="Ponte a Prueba: Notas de los Acordes" icon="mdi-help-circle-outline">
          <div v-if="!quizCompleted">
            <div class="d-flex justify-space-between align-center mb-2">
              <span class="text-subtitle-2 grey--text text--darken-2">Pregunta {{ currentQuestionIndex + 1 }} de {{
                quizQuestions.length }}</span>
              <span class="text-subtitle-2 font-weight-bold primary--text">Puntuación: {{ score }}</span>
            </div>

            <v-progress-linear :value="((currentQuestionIndex) / quizQuestions.length) * 100" color="primary"
              background-color="grey lighten-3" height="6" rounded class="mb-4"></v-progress-linear>

            <p class="text-subtitle-1 font-weight-bold grey--text text--darken-4 mb-4">
              {{ currentQuestion.question }}
            </p>

            <v-row dense class="mb-4">
              <v-col v-for="(option, idx) in currentQuestion.options" :key="idx" cols="12" sm="6">
                <v-btn block outlined :disabled="isAnswered" :color="getOptionColor(idx)"
                  class="quiz-option-btn py-6 text-left justify-start" @click="checkAnswer(idx)">
                  <v-icon left class="mr-2" :color="getOptionIconColor(idx)">
                    {{ getOptionIcon(idx) }}
                  </v-icon>
                  <span class="text-truncate text-body-2 font-weight-medium" style="color: inherit;">{{ option
                  }}</span>
                </v-btn>
              </v-col>
            </v-row>

            <v-expand-transition>
              <div v-if="isAnswered" class="mt-4">
                <v-alert :type="selectedAnswer === currentQuestion.answerIndex ? 'success' : 'error'" dense outlined
                  class="mb-4">
                  <div class="font-weight-bold mb-1">
                    {{ selectedAnswer === currentQuestion.answerIndex ? '¡Correcto!' : 'Incorrecto' }}
                  </div>
                  <div class="text-body-2">{{ currentQuestion.explanation }}</div>
                </v-alert>

                <div class="d-flex justify-end">
                  <v-btn color="primary" @click="nextQuestion">
                    {{ currentQuestionIndex + 1 === quizQuestions.length ? 'Finalizar' : 'Siguiente' }}
                    <v-icon right>mdi-arrow-right</v-icon>
                  </v-btn>
                </div>
              </div>
            </v-expand-transition>
          </div>

          <!-- Quiz Results screen -->
          <div v-else class="text-center py-6">
            <v-icon size="64" :color="score >= 3 ? 'success' : 'amber'">
              {{ score >= 3 ? 'mdi-trophy-outline' : 'mdi-school-outline' }}
            </v-icon>

            <h3 class="text-h5 font-weight-bold grey--text text--darken-4 mt-3">¡Cuestionario Completado!</h3>
            <p class="text-subtitle-1 primary--text font-weight-bold mt-1">
              Tu puntuación: {{ score }} / {{ quizQuestions.length }}
            </p>

            <v-card outlined class="pa-4 my-4 mx-auto grey lighten-5 border-grey" max-width="500">
              <p class="text-body-1 mb-0 grey--text text--darken-3">
                {{ quizFeedbackMessage }}
              </p>
            </v-card>

            <v-btn color="primary" large class="mt-2" @click="resetQuiz">
              <v-icon left>mdi-refresh</v-icon>
              Intentar de nuevo
            </v-btn>
          </div>
        </courses-section>

      </div>
    </v-expand-transition>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showContent: true,
      audioCtx: null,
      volume: 0.35,
      waveType: "triangle",

      fingerNames: ['—', 'Índice', 'Medio', 'Anular', 'Meñique'],

      selectedChordIndex: 0,

      // String order reference: 4ª G, 3ª C, 2ª E, 1ª A
      majorChords: [
        {
          name: "C",
          fullName: "Do Mayor",
          notes: [
            { latin: "Do", english: "C", degree: "1ª (Tónica)", frequency: 261.63 },
            { latin: "Mi", english: "E", degree: "3ª Mayor", frequency: 329.63 },
            { latin: "Sol", english: "G", degree: "5ª Justa", frequency: 392.00 },
          ],
          strings: [
            { label: "4ª G", fret: 0, finger: 0, note: "Sol (G)" },
            { label: "3ª C", fret: 0, finger: 0, note: "Do (C)" },
            { label: "2ª E", fret: 0, finger: 0, note: "Mi (E)" },
            { label: "1ª A", fret: 3, finger: 3, note: "Do (C)" },
          ]
        },
        {
          name: "D",
          fullName: "Re Mayor",
          notes: [
            { latin: "Re", english: "D", degree: "1ª (Tónica)", frequency: 293.66 },
            { latin: "Fa#", english: "F#", degree: "3ª Mayor", frequency: 369.99 },
            { latin: "La", english: "A", degree: "5ª Justa", frequency: 440.00 },
          ],
          strings: [
            { label: "4ª G", fret: 2, finger: 1, note: "La (A)" },
            { label: "3ª C", fret: 2, finger: 2, note: "Re (D)" },
            { label: "2ª E", fret: 2, finger: 3, note: "Fa# (F#)" },
            { label: "1ª A", fret: 0, finger: 0, note: "La (A)" },
          ]
        },
        {
          name: "E",
          fullName: "Mi Mayor",
          notes: [
            { latin: "Mi", english: "E", degree: "1ª (Tónica)", frequency: 329.63 },
            { latin: "Sol#", english: "G#", degree: "3ª Mayor", frequency: 415.30 },
            { latin: "Si", english: "B", degree: "5ª Justa", frequency: 493.88 },
          ],
          strings: [
            { label: "4ª G", fret: 4, finger: 2, note: "Si (B)" },
            { label: "3ª C", fret: 4, finger: 3, note: "Mi (E)" },
            { label: "2ª E", fret: 4, finger: 4, note: "Sol# (G#)" },
            { label: "1ª A", fret: 2, finger: 1, note: "Si (B)" },
          ]
        },
        {
          name: "F",
          fullName: "Fa Mayor",
          notes: [
            { latin: "Fa", english: "F", degree: "1ª (Tónica)", frequency: 349.23 },
            { latin: "La", english: "A", degree: "3ª Mayor", frequency: 440.00 },
            { latin: "Do", english: "C", degree: "5ª Justa", frequency: 261.63 },
          ],
          strings: [
            { label: "4ª G", fret: 2, finger: 2, note: "La (A)" },
            { label: "3ª C", fret: 0, finger: 0, note: "Do (C)" },
            { label: "2ª E", fret: 1, finger: 1, note: "Fa (F)" },
            { label: "1ª A", fret: 0, finger: 0, note: "La (A)" },
          ]
        },
        {
          name: "G",
          fullName: "Sol Mayor",
          notes: [
            { latin: "Sol", english: "G", degree: "1ª (Tónica)", frequency: 392.00 },
            { latin: "Si", english: "B", degree: "3ª Mayor", frequency: 493.88 },
            { latin: "Re", english: "D", degree: "5ª Justa", frequency: 293.66 },
          ],
          strings: [
            { label: "4ª G", fret: 0, finger: 0, note: "Sol (G)" },
            { label: "3ª C", fret: 2, finger: 2, note: "Re (D)" },
            { label: "2ª E", fret: 3, finger: 3, note: "Sol (G)" },
            { label: "1ª A", fret: 2, finger: 1, note: "Si (B)" },
          ]
        },
        {
          name: "A",
          fullName: "La Mayor",
          notes: [
            { latin: "La", english: "A", degree: "1ª (Tónica)", frequency: 440.00 },
            { latin: "Do#", english: "C#", degree: "3ª Mayor", frequency: 277.18 },
            { latin: "Mi", english: "E", degree: "5ª Justa", frequency: 329.63 },
          ],
          strings: [
            { label: "4ª G", fret: 2, finger: 2, note: "La (A)" },
            { label: "3ª C", fret: 1, finger: 1, note: "Do# (C#)" },
            { label: "2ª E", fret: 0, finger: 0, note: "Mi (E)" },
            { label: "1ª A", fret: 0, finger: 0, note: "La (A)" },
          ]
        },
      ],

      // Quiz State
      quizCompleted: false,
      currentQuestionIndex: 0,
      selectedAnswer: null,
      isAnswered: false,
      score: 0,

      quizQuestions: [
        {
          question: "¿Cuál es la fórmula de grados que forma un acorde mayor?",
          options: ["1ª (Tónica) - 3ª (Mediante) - 5ª (Dominante)", "1ª - 2ª - 3ª", "2ª - 4ª - 6ª", "1ª - 4ª - 7ª"],
          answerIndex: 0,
          explanation: "Un acorde mayor se forma con tres grados de la escala: la 1ª (Tónica), la 3ª (Mediante) y la 5ª (Dominante)."
        },
        {
          question: "¿Qué notas forman el acorde de Do Mayor (C)?",
          options: ["Do - Re - Mi", "Do - Fa - Sol", "Do - Mi - Sol", "Do - Mi - La"],
          answerIndex: 2,
          explanation: "El acorde de Do Mayor se compone de Do (Tónica), Mi (Mediante) y Sol (Dominante)."
        },
        {
          question: "¿Qué notas forman el acorde de Sol Mayor (G)?",
          options: ["Sol - Si - Re", "Sol - La - Si", "Sol - Do - Mi", "Sol - Si - Fa"],
          answerIndex: 0,
          explanation: "El acorde de Sol Mayor se forma con Sol (Tónica), Si (Mediante) y Re (Dominante)."
        },
        {
          question: "En el acorde de C en el ukelele, ¿qué cuerda se presiona y en qué traste?",
          options: ["Cuerda 1 (A), traste 3", "Cuerda 4 (G), traste 2", "Cuerda 2 (E), traste 1", "Cuerda 3 (C), traste 2"],
          answerIndex: 0,
          explanation: "El acorde de C se toca presionando el traste 3 de la cuerda 1 (A) con el dedo anular; las demás cuerdas se tocan al aire."
        }
      ]
    }
  },

  computed: {
    selectedChord() {
      return this.majorChords[this.selectedChordIndex];
    },

    currentQuestion() {
      return this.quizQuestions[this.currentQuestionIndex];
    },

    quizFeedbackMessage() {
      if (this.score === this.quizQuestions.length) {
        return "¡Perfecto! Dominas la estructura y las notas de los acordes mayores. ¡Excelente trabajo!";
      } else if (this.score >= 3) {
        return "¡Muy bien! Tienes una sólida comprensión de los acordes mayores. Repasa las preguntas falladas para afianzar el resto.";
      } else if (this.score >= 2) {
        return "¡Buen esfuerzo! Tenés los conceptos básicos, pero vale la pena repasar la teoría de las tríadas mayores.";
      } else {
        return "¡No te desanimes! Repasa la sección de teoría y explora de nuevo cada acorde para familiarizarte con sus notas.";
      }
    }
  },

  beforeDestroy() {
    // no timers to clean here
  },

  methods: {
    selectChord(index) {
      this.selectedChordIndex = index;
    },

    getFretForString(stringNumber) {
      const s = this.selectedChord.strings.find(s => s.label.includes(String(stringNumber)));
      return s ? s.fret : 0;
    },

    getFingerForString(stringNumber) {
      const s = this.selectedChord.strings.find(s => s.label.includes(String(stringNumber)));
      if (!s || s.finger === 0) return '';
      return s.finger;
    },

    getStringThickness(s) {
      if (s === 4) return 2.0;
      if (s === 3) return 3.2;
      if (s === 2) return 2.4;
      if (s === 1) return 1.5;
      return 2.0;
    },

    playTone(frequency, duration = 1.2, delay = 0) {
      if (typeof window === 'undefined') return;
      try {
        const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtxClass) return;

        if (!this.audioCtx || this.audioCtx.state === 'closed') {
          this.audioCtx = new AudioCtxClass();
        }

        if (this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }

        const ctx = this.audioCtx;
        const startTime = ctx.currentTime + delay;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = this.waveType;
        osc.frequency.setValueAtTime(frequency, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(this.volume, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("No se pudo generar sonido:", e);
      }
    },

    playChord() {
      // Play the three notes of the triad together (strummed slightly)
      this.selectedChord.notes.forEach((note, idx) => {
        this.playTone(note.frequency, 1.6, idx * 0.03);
      });
    },

    checkAnswer(optionIdx) {
      this.selectedAnswer = optionIdx;
      this.isAnswered = true;
      if (optionIdx === this.currentQuestion.answerIndex) {
        this.score++;
      }
    },

    getOptionColor(idx) {
      if (!this.isAnswered) {
        return "grey darken-2";
      }
      if (idx === this.currentQuestion.answerIndex) {
        return "success";
      }
      if (idx === this.selectedAnswer) {
        return "error";
      }
      return "grey lighten-2";
    },

    getOptionIcon(idx) {
      if (!this.isAnswered) {
        return "mdi-radiobox-blank";
      }
      if (idx === this.currentQuestion.answerIndex) {
        return "mdi-check-circle";
      }
      if (idx === this.selectedAnswer) {
        return "mdi-close-circle";
      }
      return "mdi-minus-circle-outline";
    },

    getOptionIconColor(idx) {
      if (!this.isAnswered) {
        return "grey darken-1";
      }
      if (idx === this.currentQuestion.answerIndex) {
        return "success";
      }
      if (idx === this.selectedAnswer) {
        return "error";
      }
      return "grey lighten-1";
    },

    nextQuestion() {
      this.isAnswered = false;
      this.selectedAnswer = null;
      if (this.currentQuestionIndex + 1 < this.quizQuestions.length) {
        this.currentQuestionIndex++;
      } else {
        this.quizCompleted = true;
      }
    },

    resetQuiz() {
      this.currentQuestionIndex = 0;
      this.score = 0;
      this.selectedAnswer = null;
      this.isAnswered = false;
      this.quizCompleted = false;
    }
  }
}
</script>

<style scoped>
.scale-up-pulse {
  animation: accentPulse 1.8s infinite alternate;
}

@keyframes accentPulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.3);
  }

  100% {
    transform: scale(1.1);
    box-shadow: 0 0 8px 3px rgba(25, 118, 210, 0.5);
  }
}

.fretboard-strings>div {
  align-self: stretch;
}

.border-grey {
  border: 1px solid #d0d0d5 !important;
}

.quiz-option-btn {
  text-transform: none !important;
  height: auto !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  background-color: rgba(0, 0, 0, 0.02) !important;
}

.quiz-option-btn:hover:not(.v-btn--disabled) {
  transform: translateY(-1px);
  background-color: rgba(0, 0, 0, 0.04) !important;
  border-color: var(--v-primary-base, #1976d2) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.w-100 {
  width: 100%;
}
</style>
