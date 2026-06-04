<template>
  <div>
    <courses-header v-model="showContent" title="Práctico - Día 1" />

    <v-expand-transition>
      <div v-if="showContent" class="pa-4">

        <!-- SECCION 1: Afinador de Referencia -->
        <courses-section title="Afinador de Referencia Interactivo" icon="mdi-tune">
          <p class="text-body-2 grey--text text--darken-3 mb-4">
            Usa estos tonos de referencia generados en tiempo real para afinar tu ukelele de oído.
            Toca cada cuerda y ajusta el clavijero de tu instrumento hasta que suene idéntico al tono del afinador.
          </p>

          <v-row dense class="mb-4 align-center">
            <v-col cols="12" md="8">
              <v-row dense>
                <v-col v-for="(string, index) in tuningStrings" :key="string.number" cols="6" sm="3">
                  <v-card outlined :color="activeStringIndex === index ? 'grey lighten-4' : 'transparent'"
                    class="pa-3 text-center fill-height d-flex flex-column justify-space-between align-center border-transition"
                    :style="activeStringIndex === index ? 'border-color: var(--v-primary-base, #1976d2) !important;' : ''"
                    style="cursor: pointer" @click="playString(index)">
                    <div>
                      <v-chip x-small :color="string.color" dark class="mb-2 font-weight-black">
                        Cuerda {{ string.number }}
                      </v-chip>
                      <div class="text-h4 font-weight-bold primary--text mb-1">
                        {{ string.note_en }}
                      </div>
                      <div class="text-subtitle-2 grey--text text--darken-2">
                        {{ string.note_es }}
                      </div>
                      <div class="text-caption grey--text text--darken-1">
                        {{ string.frequency }}
                      </div>
                    </div>

                    <div class="mt-3">
                      <v-btn icon :color="activeStringIndex === index ? 'primary' : 'grey'" class="elevation-1">
                        <v-icon>{{ activeStringIndex === index ? 'mdi-volume-high' : 'mdi-play-circle-outline'
                          }}</v-icon>
                      </v-btn>
                    </div>

                    <!-- Wave visualizer for active string -->
                    <div class="d-flex justify-center align-end mt-2" style="height: 16px; width: 40px;">
                      <template v-if="activeStringIndex === index">
                        <div v-for="n in 5" :key="n" class="wave-active mx-0.5 primary rounded-sm"
                          :style="`height: 100%; width: 3px; animation-delay: ${n * 0.1}s; background-color: var(--v-primary-base, #1976d2);`">
                        </div>
                      </template>
                      <template v-else>
                        <div v-for="n in 5" :key="n" class="mx-0.5 bg-grey lighten-2 rounded-sm"
                          style="height: 3px; width: 3px;"></div>
                      </template>
                    </div>
                  </v-card>
                </v-col>
              </v-row>
            </v-col>

            <v-col cols="12" md="4" class="text-center py-4">
              <v-btn :color="isPlayingAll ? 'red darken-2' : 'primary'" class="mb-3 w-100" dark large
                @click="playAllStrings">
                <v-icon left>{{ isPlayingAll ? 'mdi-stop' : 'mdi-play' }}</v-icon>
                {{ isPlayingAll ? 'Detener Afinador' : 'Afinar en Secuencia' }}
              </v-btn>

              <!-- Wave type and settings controls -->
              <v-select v-model="waveType" :items="waveOptions" label="Tipo de Sonido" dense outlined hide-details
                class="mt-2"></v-select>

              <div class="mt-4 px-2">
                <div class="d-flex justify-space-between text-caption grey--text text--darken-2 mb-1">
                  <span>Volumen</span>
                  <span>{{ Math.round(volume * 100) }}%</span>
                </div>
                <v-slider v-model="volume" min="0" max="1" step="0.05" dense hide-details color="primary"
                  track-color="grey lighten-2"></v-slider>
              </div>
            </v-col>
          </v-row>
        </courses-section>

        <!-- SECCION 2: Cuestionario de Partes del Ukelele -->
        <courses-section title="Ponte a Prueba: Identificación de Partes" icon="mdi-help-circle-outline">
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
            <v-icon size="64" :color="score >= 4 ? 'success' : 'amber'">
              {{ score >= 4 ? 'mdi-trophy-outline' : 'mdi-school-outline' }}
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

        <!-- SECCION 3: Juego de Correspondencia Latina / Inglesa -->
        <courses-section title="Ponte a Prueba: Relaciona las Notas" icon="mdi-swap-horizontal">
          <p class="text-body-2 grey--text text--darken-3 mb-4">
            Selecciona una nota en la columna <strong>latina</strong> y su equivalente en la columna
            <strong>inglesa</strong>.
            Si el par es correcto se marca en verde y sube a la zona de resueltos. ¡Completa los 7 pares!
          </p>

          <!-- Resolved pairs stacking area -->
          <v-expand-transition>
            <div v-if="matchedPairs.length > 0" class="mb-4">
              <div class="text-caption font-weight-bold grey--text text--darken-2 mb-2">
                <v-icon small color="success">mdi-check-circle</v-icon>
                Pares resueltos ({{ matchedPairs.length }} / {{ notePairs.length }}):
              </div>
              <div class="d-flex flex-wrap" style="gap: 8px;">
                <v-chip v-for="pair in matchedPairs" :key="pair.latin" color="light-green lighten-4"
                  class="font-weight-bold match-resolved-chip" style="border: 2px solid #43a047;">
                  <v-icon left small color="light-green darken-3">mdi-check-circle</v-icon>
                  <span class="light-green--text text--darken-4">{{ pair.latin }}</span>
                  <span class="mx-1 grey--text">=</span>
                  <span class="light-green--text text--darken-4">{{ pair.english }}</span>
                </v-chip>
              </div>
              <v-divider class="mt-3 mb-1" />
            </div>
          </v-expand-transition>

          <!-- Game Complete screen -->
          <div v-if="matchGameComplete" class="text-center py-8">
            <v-icon size="64" color="light-green darken-2">mdi-trophy-outline</v-icon>
            <h3 class="text-h5 font-weight-bold grey--text text--darken-4 mt-3">¡Todas las notas relacionadas!</h3>
            <p class="text-body-1 grey--text text--darken-2 mt-2">
              Dominas perfectamente la equivalencia entre notación latina e inglesa. ¡Excelente!
            </p>
            <v-btn color="primary" class="mt-4" @click="resetMatchGame">
              <v-icon left>mdi-refresh</v-icon>
              Jugar de nuevo
            </v-btn>
          </div>

          <!-- Active game -->
          <div v-else>
            <v-row no-gutters class="align-stretch">

              <!-- LEFT: Latin column -->
              <v-col cols="5">
                <div class="text-subtitle-2 font-weight-bold text-center primary--text mb-3"
                  style="letter-spacing: 0.5px;">
                  🇪🇸 Latina
                </div>
                <transition-group name="match-list" tag="div">
                  <div v-for="note in unmatchedLatin" :key="note.latin" class="mb-2">
                    <v-btn block depressed :color="getLatinBtnColor(note.latin)"
                      :dark="selectedLatinName === note.latin || wrongLatinName === note.latin" class="match-note-btn"
                      :class="{
                        'match-selected-left': selectedLatinName === note.latin && wrongLatinName === null,
                        'match-wrong-shake': wrongLatinName === note.latin
                      }" @click="selectLatin(note.latin)">
                      <span class="text-h6 font-weight-black">{{ note.latin }}</span>
                    </v-btn>
                  </div>
                </transition-group>
              </v-col>

              <!-- CENTER: connector icon -->
              <v-col cols="2" class="d-flex flex-column align-center justify-center">
                <div v-for="i in unmatchedLatin.length" :key="i" class="mb-2 d-flex align-center justify-center"
                  style="height: 44px;">
                  <v-icon small color="grey lighten-1">mdi-arrow-left-right</v-icon>
                </div>
              </v-col>

              <!-- RIGHT: English column -->
              <v-col cols="5">
                <div class="text-subtitle-2 font-weight-bold text-center orange--text text--darken-2 mb-3"
                  style="letter-spacing: 0.5px;">
                  🇬🇧 Inglesa
                </div>
                <transition-group name="match-list" tag="div">
                  <div v-for="note in unmatchedEnglish" :key="note.english" class="mb-2">
                    <v-btn block depressed :color="getEnglishBtnColor(note.english)"
                      :dark="selectedEnglishName === note.english || wrongEnglishName === note.english"
                      class="match-note-btn" :class="{
                        'match-selected-right': selectedEnglishName === note.english && wrongEnglishName === null,
                        'match-wrong-shake': wrongEnglishName === note.english
                      }" @click="selectEnglish(note.english)">
                      <span class="text-h6 font-weight-black">{{ note.english }}</span>
                    </v-btn>
                  </div>
                </transition-group>
              </v-col>
            </v-row>

            <!-- Hint bar -->
            <div class="text-center text-caption grey--text text--darken-1 mt-4">
              <v-icon x-small color="grey">mdi-information-outline</v-icon>
              Haz clic en una nota latina y luego en su equivalente inglesa para emparejarlas.
            </div>
          </div>
        </courses-section>

        <!-- SECCION 4: Escala de Do Mayor -->
        <courses-section title="Escala de Do Mayor (C Major Scale)" icon="mdi-music-clef-treble">
          <p class="text-body-2 grey--text text--darken-3 mb-3">
            La escala mayor natural se construye a partir de una nota raíz siguiendo la fórmula de intervalos:
          </p>

          <div class="d-flex justify-center align-center py-2 px-4 grey lighten-3 rounded-lg mb-4 text-center">
            <span class="font-weight-black text-subtitle-2 font-mono primary--text">
              Tono — Tono — Semitono — Tono — Tono — Tono — Semitono
            </span>
          </div>

          <p class="text-body-2 grey--text text--darken-3 mb-4">
            En el ukelele, <strong>1 Tono</strong> equivale a avanzar <strong>2 trastes</strong>, y <strong>1
              Semitono</strong> equivale a avanzar <strong>1 traste</strong>.
            Explora la escala a continuación. Haz clic en las notas para escuchar su sonido y ver en qué traste y
            cuerda se
            colocan tus dedos.
          </p>

          <v-row dense class="align-center">
            <!-- Column 1: Scale selector and explanations -->
            <v-col cols="12" md="7" class="pr-md-4">
              <!-- Scale Step Visualizer (Horizontal Buttons) -->
              <div class="d-flex align-center justify-space-between flex-wrap mb-6 py-2 px-1 rounded grey lighten-4">
                <template v-for="(note, index) in scaleNotes">
                  <div :key="`note-${index}`" class="d-flex align-center justify-center flex-grow-1 my-1">
                    <v-btn fab small :color="selectedNoteIndex === index ? 'primary' : 'grey lighten-2'"
                      class="elevation-2 font-weight-black text-subtitle-1"
                      :class="selectedNoteIndex === index ? 'white--text scale-up-pulse' : 'grey--text text--darken-3'"
                      style="width: 38px; height: 38px;" @click="selectNote(index)">
                      {{ note.name }}
                    </v-btn>

                    <!-- Connector indicating Tone / Semitone interval -->
                    <div v-if="index < scaleNotes.length - 1" class="note-step-connector"
                      :class="{ active: selectedNoteIndex === index || selectedNoteIndex === index + 1 }"
                      style="position: relative;">
                      <span class="text-caption font-weight-black font-mono"
                        :style="selectedNoteIndex === index ? 'color: var(--v-primary-base, #1976d2)' : 'color: #888'"
                        style="position: absolute; top: -18px; left: 50%; transform: translateX(-50%); font-size: 0.65rem !important;">
                        {{ scaleNotes[index].intervalLabel }}
                      </span>
                    </div>
                  </div>
                </template>
              </div>

              <!-- Active Note details card -->
              <v-card outlined class="pa-4 grey lighten-5 mb-4"
                style="border-color: rgba(25, 118, 210, 0.25) !important;">
                <div class="d-flex align-center justify-space-between mb-2">
                  <span class="text-h5 font-weight-black text-capitalize primary--text">
                    {{ selectedNote.name }} <span class="text-subtitle-2 grey--text">({{ selectedNote.english
                      }})</span>
                  </span>
                  <v-chip small color="primary" outlined>
                    {{ selectedNote.role }}
                  </v-chip>
                </div>

                <v-divider class="mb-3" />

                <v-row dense>
                  <v-col cols="6">
                    <div class="text-caption grey--text">Frecuencia</div>
                    <div class="text-body-1 font-weight-bold grey--text text--darken-4">{{ selectedNote.frequency }}
                      Hz</div>
                  </v-col>
                  <v-col cols="6">
                    <div class="text-caption grey--text">Intervalo previo</div>
                    <div class="text-body-1 font-weight-bold font-mono amber--text text--darken-3">
                      {{ selectedNote.intervalDesc }}
                    </div>
                  </v-col>
                  <v-col cols="12" class="mt-2">
                    <div class="text-caption grey--text">Instrucciones de digitación</div>
                    <div class="text-body-2 mt-1 grey--text text--darken-4">
                      <v-icon small color="primary" class="mr-1">mdi-hand-pointing-right</v-icon>
                      {{ selectedNote.instructions }}
                    </div>
                  </v-col>
                </v-row>
              </v-card>

              <div class="d-flex flex-wrap gap-2">
                <v-btn :color="isPlayingScale ? 'red darken-2' : 'primary'" class="mr-2 mb-2 white--text"
                  @click="playScaleSequence">
                  <v-icon left>{{ isPlayingScale ? 'mdi-stop' : 'mdi-play-circle' }}</v-icon>
                  {{ isPlayingScale ? 'Detener escala' : 'Reproducir Escala' }}
                </v-btn>

                <v-btn outlined color="grey darken-2" class="mb-2" @click="playTone(selectedNote.frequency, 1.2)">
                  <v-icon left>mdi-music-note</v-icon>
                  Sonar Nota Actual
                </v-btn>
              </div>
            </v-col>

            <!-- Column 2: Fretboard diagram -->
            <v-col cols="12" md="5" class="d-flex justify-center">
              <v-card outlined class="pa-4 w-100" max-width="340">
                <div class="text-subtitle-2 font-weight-bold text-center grey--text text--darken-2 mb-3">
                  Diagrama del Diapasón
                </div>

                <div class="fretboard-container mx-auto" style="max-width: 280px; padding: 0 32px;">
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

                    <!-- ── Vertical string lines running full height ── -->
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
                        style="flex: 1; height: 28px;">
                        <v-avatar v-if="selectedNote.string === s && selectedNote.fret === 0" color="primary"
                          size="26" class="elevation-4 scale-up-pulse font-weight-black white--text"
                          style="font-size: 0.7rem; border: 2px solid white;">
                          {{ selectedNote.name }}
                        </v-avatar>
                        <div v-else class="rounded-circle"
                          style="width: 6px; height: 6px; background: rgba(255,255,255,0.3);"></div>
                      </div>
                    </div>

                    <!-- ── Nut (cejilla) ── -->
                    <div style="
                      height: 8px;
                      background: linear-gradient(180deg, #f5f0e8 0%, #ffffff 50%, #d8d0c0 100%);
                      border-top: 2px solid #aaa;
                      border-bottom: 2px solid #888;
                      box-shadow: 0 2px 4px rgba(0,0,0,0.5);
                      position: relative; z-index: 3;
                    "></div>

                    <!-- ── Frets 1 to 4 ── -->
                    <div v-for="f in [1, 2, 3, 4]" :key="f" style="position: relative;"
                      :style="{ borderBottom: f < 4 ? '3px solid #9a8060' : 'none', height: '56px' }">
                      <!-- Fret label on the left -->
                      <span class="text-caption font-weight-bold"
                        style="position: absolute; left: -28px; top: 50%; transform: translateY(-50%); color: #666; font-size: 0.62rem;">Tr.{{
                        f }}</span>

                      <!-- Position dot on fret 3 -->
                      <div v-if="f === 3" class="rounded-circle"
                        style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 8px; height: 8px; background: rgba(255,255,255,0.4); border: 1px solid rgba(255,255,255,0.2); z-index: 2;">
                      </div>

                      <!-- Note avatars per string, centered in each cell -->
                      <div class="d-flex justify-space-around fill-height align-center"
                        style="position: relative; z-index: 4;">
                        <div v-for="s in [4, 3, 2, 1]" :key="s" class="d-flex justify-center align-center"
                          style="flex: 1; height: 100%;">
                          <v-avatar v-if="selectedNote.string === s && selectedNote.fret === f" color="amber accent-4"
                            size="28" class="elevation-6 scale-up-pulse font-weight-black black--text"
                            style="z-index: 5; font-size: 0.68rem; border: 2px solid #fff;">
                            {{ selectedNote.name }}
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
                    <span class="primary--text font-weight-bold">●</span> cuerda al aire &nbsp;|&nbsp;
                    <span class="amber--text text--darken-3 font-weight-bold">●</span> presionar traste
                  </div>
                </div>
              </v-card>
            </v-col>
          </v-row>
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
      activeStringIndex: null,
      isPlayingAll: false,
      stringTimeout: null,

      // Synthesizer Settings
      waveType: "triangle",
      volume: 0.35,
      audioCtx: null,

      waveOptions: [
        { text: "Acústico (Triangular)", value: "triangle" },
        { text: "Suave (Sinusoidal)", value: "sine" },
        { text: "Metálico (Sierra)", value: "sawtooth" },
        { text: "Digital (Cuadrado)", value: "square" },
      ],

      tuningStrings: [
        {
          number: 4,
          note_en: "G",
          note_es: "Sol",
          frequency: "392 Hz",
          frequencyHz: 392.00,
          color: "green darken-1",
        },
        {
          number: 3,
          note_en: "C",
          note_es: "Do",
          frequency: "262 Hz",
          frequencyHz: 261.63,
          color: "blue darken-1",
        },
        {
          number: 2,
          note_en: "E",
          note_es: "Mi",
          frequency: "330 Hz",
          frequencyHz: 329.63,
          color: "orange darken-1",
        },
        {
          number: 1,
          note_en: "A",
          note_es: "La",
          frequency: "440 Hz",
          frequencyHz: 440.00,
          color: "red darken-1",
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
          question: "¿Qué parte del ukelele se gira para ajustar la tensión de las cuerdas al afinar?",
          options: ["Puente inferior", "Mástil", "Clavijeros", "Cejilla superior"],
          answerIndex: 2,
          explanation: "Los clavijeros son las llaves o engranajes mecánicos en la pala que tensan o aflojan las cuerdas para modificar y afinar su tono."
        },
        {
          question: "¿Cómo se llaman las barritas metálicas incrustadas a lo largo del diapasón?",
          options: ["Cejillas", "Trastes", "Cuerdas", "Clavijas"],
          answerIndex: 1,
          explanation: "Los trastes son las barras metálicas que dividen el mástil. Al presionar una cuerda contra un traste, acortas la distancia de vibración, aumentando el tono."
        },
        {
          question: "¿Qué pieza guía las cuerdas en la parte superior del mástil y marca el inicio de la escala?",
          options: ["Cejilla superior", "Boca (Sound hole)", "Puente inferior", "Diapasón"],
          answerIndex: 0,
          explanation: "La cejilla superior (nut) mantiene separadas y elevadas las cuerdas en el extremo del diapasón, sirviendo de frontera entre el mástil y la pala."
        },
        {
          question: "¿Cuál es el cuerpo hueco del ukelele que sirve para amplificar acústicamente el sonido?",
          options: ["Mástil", "Caja de resonancia", "Boca (Sound hole)", "Pala (Headstock)"],
          answerIndex: 1,
          explanation: "La caja de resonancia vibra junto con las cuerdas, acumulando el aire interno para amplificar y proyectar el sonido a través de la boca."
        },
        {
          question: "¿Qué nota produce la cuerda número 3 del ukelele al aire en afinación estándar?",
          options: ["La (A)", "Sol (G)", "Do (C)", "Mi (E)"],
          answerIndex: 2,
          explanation: "En afinación estándar (G-C-E-A), la tercera cuerda se afina en Do (C4). Es la cuerda de mayor grosor y produce la nota más grave del instrumento al aire."
        },
        {
          question: "¿Para qué sirve la Boca (Sound hole) del ukelele?",
          options: ["Para sostener las cuerdas en la base", "Para ajustar la afinación", "Para que el sonido salga con mayor proyección", "Para marcar el inicio del diapasón"],
          answerIndex: 2,
          explanation: "La Boca o Sound hole es el agujero circular en la tapa del instrumento. Permite que las ondas sonoras amplificadas dentro de la caja de resonancia salgan hacia afuera, aumentando la proyección y el volumen del sonido."
        },
        {
          question: "¿En qué parte del ukelele se ubican los trastes y donde se presionan los acordes?",
          options: ["Caja de resonancia", "Pala (Headstock)", "Cejilla inferior", "Mástil (Diapasón)"],
          answerIndex: 3,
          explanation: "El mástil incluye el diapasón, que es la superficie donde se colocan los dedos para presionar las cuerdas contra los trastes y producir distintas notas y acordes."
        },
        {
          question: "¿Cuántas cuerdas tiene un ukelele estándar y de qué material suelen ser?",
          options: ["6 cuerdas de acero", "5 cuerdas de tripa", "4 cuerdas de nylon o fluorocarbono", "4 cuerdas de acero"],
          answerIndex: 2,
          explanation: "El ukelele estándar tiene 4 cuerdas, generalmente fabricadas en nylon o fluorocarbono. Este material les da su sonido característico brillante y suave, diferente al acero de la guitarra."
        }
      ],

      // Match Game State
      notePairs: [
        { latin: 'Do', english: 'C' },
        { latin: 'Re', english: 'D' },
        { latin: 'Mi', english: 'E' },
        { latin: 'Fa', english: 'F' },
        { latin: 'Sol', english: 'G' },
        { latin: 'La', english: 'A' },
        { latin: 'Si', english: 'B' },
      ],
      shuffledEnglish: [],
      matchedPairs: [],
      selectedLatinName: null,
      selectedEnglishName: null,
      wrongLatinName: null,
      wrongEnglishName: null,
      wrongTimeout: null,
      matchGameComplete: false,

      // Scale State
      selectedNoteIndex: 0,
      isPlayingScale: false,

      scaleNotes: [
        {
          name: "Do",
          english: "C4",
          frequency: 261.63,
          string: 3,
          fret: 0,
          role: "Nota Raíz (Tónica)",
          intervalLabel: "T",
          intervalDesc: "Inicio de la escala",
          instructions: "Toca la cuerda 3 al aire (sin presionar ningún traste)."
        },
        {
          name: "Re",
          english: "D4",
          frequency: 293.66,
          string: 3,
          fret: 2,
          role: "Segunda Mayor",
          intervalLabel: "T",
          intervalDesc: "+1 Tono (avanza 2 trastes)",
          instructions: "Coloca tu dedo índice o medio en el traste 2 de la cuerda 3."
        },
        {
          name: "Mi",
          english: "E4",
          frequency: 329.63,
          string: 2,
          fret: 0,
          role: "Tercera Mayor",
          intervalLabel: "S",
          intervalDesc: "+1 Tono (cambio de cuerda)",
          instructions: "Toca la cuerda 2 al aire (sin presionar ningún traste)."
        },
        {
          name: "Fa",
          english: "F4",
          frequency: 349.23,
          string: 2,
          fret: 1,
          role: "Cuarta Justa",
          intervalLabel: "T",
          intervalDesc: "+1/2 Tono (avanza 1 traste)",
          instructions: "Presiona el traste 1 de la cuerda 2 (se suele usar el dedo índice)."
        },
        {
          name: "Sol",
          english: "G4",
          frequency: 392.00,
          string: 2,
          fret: 3,
          role: "Quinta Justa",
          intervalLabel: "T",
          intervalDesc: "+1 Tono (avanza 2 trastes)",
          instructions: "Presiona el traste 3 de la cuerda 2 (se suele usar el dedo anular)."
        },
        {
          name: "La",
          english: "A4",
          frequency: 440.00,
          string: 1,
          fret: 0,
          role: "Sexta Mayor",
          intervalLabel: "T",
          intervalDesc: "+1 Tono (cambio de cuerda)",
          instructions: "Toca la cuerda 1 al aire (sin presionar ningún traste)."
        },
        {
          name: "Si",
          english: "B4",
          frequency: 493.88,
          string: 1,
          fret: 2,
          role: "Séptima Mayor",
          intervalLabel: "S",
          intervalDesc: "+1 Tono (avanza 2 trastes)",
          instructions: "Presiona el traste 2 de la cuerda 1 (se suele usar el dedo medio)."
        },
        {
          name: "Do",
          english: "C5",
          frequency: 523.25,
          string: 1,
          fret: 3,
          role: "Octava (Tónica)",
          intervalLabel: "",
          intervalDesc: "+1/2 Tono (avanza 1 traste)",
          instructions: "Presiona el traste 3 de la cuerda 1 (se suele usar el dedo anular)."
        }
      ]
    }
  },

  computed: {
    unmatchedLatin() {
      const matched = this.matchedPairs.map(p => p.latin);
      return this.notePairs.filter(p => !matched.includes(p.latin));
    },

    unmatchedEnglish() {
      const matched = this.matchedPairs.map(p => p.english);
      return this.shuffledEnglish.filter(p => !matched.includes(p.english));
    },

    currentQuestion() {
      return this.quizQuestions[this.currentQuestionIndex];
    },

    selectedNote() {
      return this.scaleNotes[this.selectedNoteIndex];
    },

    quizFeedbackMessage() {
      if(this.score === 8) {
        return "¡Perfecto! 8/8 — Tienes una comprensión impecable de la estructura de tu ukelele. ¡Eres un estudiante excepcional!";
      } else if(this.score >= 6) {
        return "¡Excelente trabajo! Dominás la mayoría de los conceptos. Repasa las preguntas que fallaste para completar tu comprensión.";
      } else if(this.score >= 4) {
        return "¡Buen esfuerzo! Tenés los conceptos básicos pero hay algunos detalles que vale la pena repasar en la lección teórica del Día 1.";
      } else {
        return "¡No te desanimes! El ukelele es nuevo para vos. Te recomendamos releer el material teórico del Día 1 e intentarlo de nuevo con más confianza.";
      }
    }
  },

  mounted() {
    this.initMatchGame();
  },

  beforeDestroy() {
    if(this.stringTimeout) clearTimeout(this.stringTimeout);
    if(this.wrongTimeout) clearTimeout(this.wrongTimeout);
    this.isPlayingAll = false;
    this.isPlayingScale = false;
  },

  methods: {
    toggleContent() {
      this.showContent = !this.showContent;
    },

    playTone(frequency, duration = 1.2) {
      if(typeof window === 'undefined') return;
      try {
        const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
        if(!AudioCtxClass) return;

        if(!this.audioCtx || this.audioCtx.state === 'closed') {
          this.audioCtx = new AudioCtxClass();
        }

        if(this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }

        const ctx = this.audioCtx;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = this.waveType;
        osc.frequency.setValueAtTime(frequency, ctx.currentTime);

        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(this.volume, ctx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + duration);
      } catch(e) {
        // eslint-disable-next-line no-console
        console.error("No se pudo generar sonido:", e);
      }
    },

    playString(index) {
      const string = this.tuningStrings[index];
      if(!string) return;

      this.activeStringIndex = index;
      this.playTone(string.frequencyHz, 1.4);

      if(this.stringTimeout) clearTimeout(this.stringTimeout);
      this.stringTimeout = setTimeout(() => {
        if(this.activeStringIndex === index) {
          this.activeStringIndex = null;
        }
      }, 1400);
    },

    async playAllStrings() {
      if(this.isPlayingAll) {
        this.isPlayingAll = false;
        this.activeStringIndex = null;
        return;
      }

      this.isPlayingAll = true;
      for(let i = 0; i < this.tuningStrings.length; i++) {
        if(!this.isPlayingAll) break;
        this.playString(i);
        await new Promise((resolve) => setTimeout(resolve, 1600));
      }
      this.isPlayingAll = false;
    },

    checkAnswer(optionIdx) {
      this.selectedAnswer = optionIdx;
      this.isAnswered = true;
      if(optionIdx === this.currentQuestion.answerIndex) {
        this.score++;
      }
    },

    getOptionColor(idx) {
      if(!this.isAnswered) {
        return "grey darken-2";
      }
      if(idx === this.currentQuestion.answerIndex) {
        return "success";
      }
      if(idx === this.selectedAnswer) {
        return "error";
      }
      return "grey lighten-2";
    },

    getOptionIcon(idx) {
      if(!this.isAnswered) {
        return "mdi-radiobox-blank";
      }
      if(idx === this.currentQuestion.answerIndex) {
        return "mdi-check-circle";
      }
      if(idx === this.selectedAnswer) {
        return "mdi-close-circle";
      }
      return "mdi-minus-circle-outline";
    },

    getOptionIconColor(idx) {
      if(!this.isAnswered) {
        return "grey darken-1";
      }
      if(idx === this.currentQuestion.answerIndex) {
        return "success";
      }
      if(idx === this.selectedAnswer) {
        return "error";
      }
      return "grey lighten-1";
    },

    nextQuestion() {
      this.isAnswered = false;
      this.selectedAnswer = null;
      if(this.currentQuestionIndex + 1 < this.quizQuestions.length) {
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
    },

    selectNote(index) {
      this.selectedNoteIndex = index;
      const note = this.scaleNotes[index];
      this.playTone(note.frequency, 1.2);
    },

    async playScaleSequence() {
      if(this.isPlayingScale) {
        this.isPlayingScale = false;
        return;
      }

      this.isPlayingScale = true;

      for(let i = 0; i < this.scaleNotes.length; i++) {
        if(!this.isPlayingScale) break;
        this.selectNote(i);
        await new Promise((resolve) => setTimeout(resolve, 900));
      }

      if(this.isPlayingScale) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      for(let i = this.scaleNotes.length - 2; i >= 0; i--) {
        if(!this.isPlayingScale) break;
        this.selectNote(i);
        await new Promise((resolve) => setTimeout(resolve, 900));
      }

      this.isPlayingScale = false;
    },

    getStringThickness(s) {
      if(s === 4) return 2.0;
      if(s === 3) return 3.2;
      if(s === 2) return 2.4;
      if(s === 1) return 1.5;
      return 2.0;
    },

    // ───── Match Game ─────
    initMatchGame() {
      const arr = this.notePairs.map(p => ({ english: p.english }));
      for(let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
      }
      this.shuffledEnglish = arr;
    },

    selectLatin(name) {
      if(this.wrongLatinName) return;
      this.selectedLatinName = this.selectedLatinName === name ? null : name;
      this.tryMatch();
    },

    selectEnglish(english) {
      if(this.wrongLatinName) return;
      this.selectedEnglishName = this.selectedEnglishName === english ? null : english;
      this.tryMatch();
    },

    tryMatch() {
      if(!this.selectedLatinName || !this.selectedEnglishName) return;
      const pair = this.notePairs.find(p => p.latin === this.selectedLatinName);
      if(pair && pair.english === this.selectedEnglishName) {
        // Correct match
        this.matchedPairs.push({ latin: this.selectedLatinName, english: this.selectedEnglishName });
        this.selectedLatinName = null;
        this.selectedEnglishName = null;
        if(this.matchedPairs.length === this.notePairs.length) {
          this.matchGameComplete = true;
        }
      } else {
        // Wrong match — flash red then clear
        this.wrongLatinName = this.selectedLatinName;
        this.wrongEnglishName = this.selectedEnglishName;
        if(this.wrongTimeout) clearTimeout(this.wrongTimeout);
        this.wrongTimeout = setTimeout(() => {
          this.wrongLatinName = null;
          this.wrongEnglishName = null;
          this.selectedLatinName = null;
          this.selectedEnglishName = null;
        }, 900);
      }
    },

    getLatinBtnColor(name) {
      if(this.wrongLatinName === name) return 'red lighten-4';
      if(this.selectedLatinName === name) return 'primary';
      return 'grey lighten-3';
    },

    getEnglishBtnColor(english) {
      if(this.wrongEnglishName === english) return 'red lighten-4';
      if(this.selectedEnglishName === english) return 'orange darken-1';
      return 'grey lighten-3';
    },

    resetMatchGame() {
      this.matchedPairs = [];
      this.selectedLatinName = null;
      this.selectedEnglishName = null;
      this.wrongLatinName = null;
      this.wrongEnglishName = null;
      this.matchGameComplete = false;
      this.initMatchGame();
    }
  }
}
</script>

<style scoped>
.wave-active {
  animation: wavePulse 1.2s infinite ease-in-out;
}

@keyframes wavePulse {

  0%,
  100% {
    transform: scaleY(0.2);
    opacity: 0.5;
  }

  50% {
    transform: scaleY(1);
    opacity: 1;
  }
}

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

.note-step-connector {
  flex-grow: 1;
  height: 3px;
  background-color: #d0d0d5;
  margin: 0 2px;
  min-width: 6px;
  transition: all 0.3s;
}

.fretboard-strings>div {
  align-self: stretch;
}

.note-step-connector.active {
  background-color: var(--v-primary-base, #1976d2);
  box-shadow: 0 0 5px rgba(25, 118, 210, 0.4);
}

.border-transition {
  transition: border-color 0.25s ease-in-out, background-color 0.25s ease-in-out;
  border-width: 1px;
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

.gap-2 {
  gap: 8px;
}

.w-100 {
  width: 100%;
}

/* ── Match Game ── */
.match-note-btn {
  text-transform: none !important;
  height: 44px !important;
  font-size: 1.1rem !important;
  transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1) !important;
  border-radius: 8px !important;
}

.match-note-btn:hover:not(.v-btn--disabled) {
  transform: scale(1.04);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.match-selected-left {
  border: 2px solid var(--v-primary-base, #1976d2) !important;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.2) !important;
}

.match-selected-right {
  border: 2px solid #e65100 !important;
  box-shadow: 0 0 0 3px rgba(230, 81, 0, 0.2) !important;
}

.match-wrong-shake {
  animation: matchShake 0.45s ease;
  border: 2px solid #e53935 !important;
}

@keyframes matchShake {
  0% {
    transform: translateX(0);
  }

  20% {
    transform: translateX(-7px);
  }

  40% {
    transform: translateX(7px);
  }

  60% {
    transform: translateX(-4px);
  }

  80% {
    transform: translateX(4px);
  }

  100% {
    transform: translateX(0);
  }
}

.match-resolved-chip {
  animation: resolvePopUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes resolvePopUp {
  0% {
    opacity: 0;
    transform: scale(0.6) translateY(12px);
  }

  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.match-list-enter-active {
  transition: all 0.3s ease;
}

.match-list-leave-active {
  transition: all 0.3s ease;
  position: absolute;
}

.match-list-enter,
.match-list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>