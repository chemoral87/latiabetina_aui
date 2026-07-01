<template>
  <div>
    <courses-header v-model="showContent" title="Teológico - Día 5" />

    <v-expand-transition>
      <div v-if="showContent" class="pa-4">

        <!-- SECCIÓN 1: La Armonía — El Sonido del Cielo en la Tierra -->
        <courses-section outlined title="La Armonía — El Sonido del Cielo en la Tierra" icon="mdi-music-note-eighth" text-class="">
          <p class="text-body-1 grey--text text--darken-3 mb-4">
            La armonía musical requiere que cada nota conozca su lugar y se subordine a una tonalidad
            común. En la vida espiritual, la armonía entre creyentes refleja la unidad que Dios llama
            a guardar: no uniformidad de caracteres, sino convergencia en el mismo Señor.
            Pablo describe este llamado con dos textos que se complementan.
          </p>
          <v-row dense class="mb-3">
            <v-col cols="12" md="6" class="d-flex">
              <v-card outlined class="pa-4 grey lighten-5 w-100 d-flex flex-column justify-space-between">
                <div>
                  <div class="d-flex align-center mb-2">
                    <v-icon color="primary" class="mr-2">mdi-book-open-variant</v-icon>
                    <span class="font-weight-bold grey--text text--darken-4">Colosenses 3:14-15</span>
                  </div>
                  <p class="text-body-2 italic grey--text text--darken-3 mb-0">
                    "Vestíos de amor, que es el vínculo perfecto. Y la paz de Dios gobierne en vuestros
                    corazones, a la que fuisteis llamados en un solo cuerpo."
                  </p>
                </div>
                <div class="text-caption primary--text font-weight-bold mt-2 text-right">RVR1960</div>
              </v-card>
            </v-col>
            <v-col cols="12" md="6" class="d-flex">
              <v-card outlined class="pa-4 grey lighten-5 w-100 d-flex flex-column justify-space-between">
                <div>
                  <div class="d-flex align-center mb-2">
                    <v-icon color="primary" class="mr-2">mdi-book-open-variant</v-icon>
                    <span class="font-weight-bold grey--text text--darken-4">Efesios 4:2-3</span>
                  </div>
                  <p class="text-body-2 italic grey--text text--darken-3 mb-0">
                    "Con toda humildad y mansedumbre, soportándoos con paciencia los unos a los otros
                    en amor, solícitos en guardar la unidad del Espíritu en el vínculo de la paz."
                  </p>
                </div>
                <div class="text-caption primary--text font-weight-bold mt-2 text-right">RVR1960</div>
              </v-card>
            </v-col>
          </v-row>
          <v-alert type="info" border="left" colored-border elevation="1" class="mb-0">
            <div class="text-body-2 font-weight-medium grey--text text--darken-4">
              "Guardar la unidad" no es crearla: ya existe en el Espíritu. La tarea del creyente es
              no romperla. Como el músico que cuida la afinación ya lograda, el cuerpo cuida el
              acuerdo que Cristo produjo mediante su obra redentora.
            </div>
          </v-alert>
        </courses-section>

        <!-- SECCIÓN 2: Consonancia y Disonancia Espiritual -->
        <courses-section outlined title="Consonancia y Disonancia Espiritual" icon="mdi-sine-wave" text-class="">
          <p class="text-body-1 grey--text text--darken-3 mb-4">
            En la música tonal hay intervalos consonantes y disonantes. La disonancia no es un error;
            es tensión que el compositor resuelve intencionalmente, produciendo una armonía más rica.
            Lo mismo ocurre en la iglesia: los conflictos, entregados a Dios y resueltos en amor y
            verdad, pueden generar una unidad más profunda que la que existía antes.
            <strong>El perdón es la resolución armónica del Evangelio.</strong>
          </p>
          <v-row dense class="mb-3">
            <v-col cols="12" md="6">
              <v-card outlined class="pa-4 fill-height" style="border-radius:10px;">
                <div class="d-flex align-center mb-2">
                  <v-icon color="green darken-2" class="mr-2">mdi-check-decagram</v-icon>
                  <span class="text-subtitle-2 font-weight-bold green--text text--darken-2">Consonancia espiritual</span>
                </div>
                <v-list dense>
                  <v-list-item v-for="item in consonances" :key="item" class="px-0 py-0">
                    <v-list-item-icon class="mr-2 my-1">
                      <v-icon color="green darken-1" x-small>mdi-music-note</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title class="text-body-2 grey--text text--darken-3 text-wrap">{{ item }}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-col>
            <v-col cols="12" md="6">
              <v-card outlined class="pa-4 fill-height" style="border-radius:10px;">
                <div class="d-flex align-center mb-2">
                  <v-icon color="orange darken-2" class="mr-2">mdi-alert-outline</v-icon>
                  <span class="text-subtitle-2 font-weight-bold orange--text text--darken-2">Disonancia que busca resolución</span>
                </div>
                <v-list dense>
                  <v-list-item v-for="item in dissonances" :key="item" class="px-0 py-0">
                    <v-list-item-icon class="mr-2 my-1">
                      <v-icon color="orange darken-1" x-small>mdi-music-note-off</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title class="text-body-2 grey--text text--darken-3 text-wrap">{{ item }}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-col>
          </v-row>

          <v-card outlined class="pa-4 mb-0" style="border-radius:10px; border-left: 4px solid #1976D2;">
            <div class="d-flex align-center mb-2">
              <v-icon color="primary" class="mr-2">mdi-music-clef-treble</v-icon>
              <span class="text-subtitle-2 font-weight-bold primary--text">Las "notas" de Colosenses 3 — la tonalidad del amor</span>
            </div>
            <v-row dense>
              <v-col v-for="note in colossians" :key="note.label" cols="12" sm="6" md="4">
                <div class="d-flex align-start pa-2">
                  <v-icon :color="note.color" small class="mr-2 mt-1 flex-shrink-0">{{ note.icon }}</v-icon>
                  <div>
                    <span class="text-caption font-weight-bold grey--text text--darken-4">{{ note.label }}</span>
                    <span class="text-caption primary--text font-weight-medium"> ({{ note.ref }})</span>
                    <span class="text-caption grey--text text--darken-2">: {{ note.desc }}</span>
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-card>
        </courses-section>

        <!-- SECCIÓN 3: Aplicación Práctica -->
        <courses-section outlined title="Aplicación Práctica" icon="mdi-hand-pointing-right" text-class="">
          <v-alert type="warning" border="left" colored-border elevation="1" class="mb-0">
            <div class="text-body-2 font-weight-medium grey--text text--darken-4">
              Esta semana, cuando practiques un acorde en tu ukelele, escucha si todas las cuerdas suenan
              con igual claridad. Si alguna "buzza" o se apaga, corrígela antes de continuar. Haz lo mismo
              en tus relaciones: si hay algo que "suena mal" con un hermano, no lo dejes resonar. Habla
              con amor, busca la resolución, y recuerda que el perdón no es debilidad: es la resolución
              armónica que convierte la tensión en una comunión más profunda.
            </div>
          </v-alert>
        </courses-section>

      </div>
    </v-expand-transition>
  </div>
</template>

<script>
export default {
  name: "UkeleleTheologicalDay5",
  data() {
    return {
      showContent: true,
      consonances: [
        "Perdonarse mutuamente como Dios perdonó en Cristo (Col 3:13)",
        "Edificarse unos a otros con enseñanza y sabiduría (Col 3:16)",
        "Actuar en nombre de Cristo en todo lo que se hace (Col 3:17)",
        "Dar gracias a Dios como actitud de vida constante (Col 3:15)",
      ],
      dissonances: [
        "El enojo y la ira no gestionados a tiempo (Col 3:8)",
        "La mentira que destruye la confianza entre hermanos (Col 3:9)",
        "El rencor guardado que fermenta y pudre la comunión",
        "La crítica destructiva disfrazada de \"corrección fraterna\"",
      ],
      colossians: [
        { label: "Misericordia", icon: "mdi-hand-heart-outline", color: "pink darken-1", desc: "Ver la necesidad del otro antes que su falta.", ref: "Col 3:12" },
        { label: "Benignidad", icon: "mdi-emoticon-happy-outline", color: "orange darken-1", desc: "Responder con gentileza incluso cuando el ambiente es hostil.", ref: "Col 3:12" },
        { label: "Humildad", icon: "mdi-bow-arrow", color: "blue darken-1", desc: "No insistir en que el conjunto gire alrededor de tu voz.", ref: "Col 3:12" },
        { label: "Mansedumbre", icon: "mdi-feather", color: "green darken-1", desc: "Fuerza bajo control; dominio propio que protege al más débil.", ref: "Col 3:12" },
        { label: "Paciencia", icon: "mdi-timer-sand", color: "brown darken-1", desc: "Dar tiempo al Espíritu sin forzar resoluciones prematuras.", ref: "Col 3:12" },
        { label: "Perdón", icon: "mdi-peace", color: "purple darken-1", desc: "La resolución armónica definitiva; convierte la disonancia en belleza.", ref: "Col 3:13" },
      ],
    };
  },
};
</script>

<style scoped>
.italic { font-style: italic; }
.w-100 { width: 100%; }
.text-wrap { white-space: normal; }
</style>
