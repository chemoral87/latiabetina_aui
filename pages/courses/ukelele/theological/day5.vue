<template>
  <div>
    <courses-header v-model="showContent" title="Teológico - Día 5" />

    <v-expand-transition>
      <div v-if="showContent" class="pa-4">
        <!-- SECCIÓN 1: La Armonía — El Sonido del Cielo en la Tierra -->
        <courses-section outlined title="La Armonía — El Sonido del Cielo en la Tierra" icon="mdi-music-note-eighth"
          text-class="">
          <p class="text-body-1 grey--text text--darken-3 mb-4">
            La armonía musical no ocurre por accidente. Requiere que cada nota conozca su lugar, respete
            las demás y se subordine a una tonalidad común. En la vida espiritual, la armonía entre los
            creyentes es el reflejo terrenal de la vida trinitaria: el Padre, el Hijo y el Espíritu
            Santo, distintos en persona, perfectos en unidad, eternamente en armonía.
          </p>

          <v-row dense>
            <v-col cols="12" md="6" class="d-flex">
              <v-card outlined class="pa-4 grey lighten-5 w-100 d-flex flex-column justify-space-between">
                <div>
                  <div class="d-flex align-center mb-2">
                    <v-icon color="primary" class="mr-2">mdi-book-open-variant</v-icon>
                    <span class="font-weight-bold grey--text text--darken-4">Colosenses 3:14-15</span>
                  </div>
                  <p class="text-body-2 italic grey--text text--darken-3 mb-0">
                    "Y sobre todas estas cosas vestíos de amor, que es el vínculo perfecto. Y la paz de
                    Dios gobierne en vuestros corazones, a la que asimismo fuisteis llamados en un solo
                    cuerpo; y sed agradecidos."
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
                    "Con toda humildad y mansedumbre, soportándoos con paciencia los unos a los otros en
                    amor, solícitos en guardar la unidad del Espíritu en el vínculo de la paz."
                  </p>
                </div>
                <div class="text-caption primary--text font-weight-bold mt-2 text-right">RVR1960</div>
              </v-card>
            </v-col>
          </v-row>

          <v-alert type="info" border="left" colored-border elevation="1" class="mt-2 mb-0">
            <div class="text-body-2 font-weight-medium grey--text text--darken-4">
              Guardar la unidad del Espíritu no significa que todos piensen, hablen o canten en la misma
              altura. Significa que todos apuntan a la misma gloria. En música, eso es armonía vocal:
              voces distintas, registros distintos, pero convergiendo en la misma melodía y el mismo
              destino.
            </div>
          </v-alert>
        </courses-section>

        <!-- SECCIÓN 2: Anatomía de la Armonía Espiritual -->
        <courses-section outlined title="Anatomía de la Armonía Espiritual" icon="mdi-sine-wave" text-class="">
          <p class="text-body-1 grey--text text--darken-3 mb-4">
            Así como en la teoría musical hay intervalos que suenan consonantes y otros que producen
            tensión —disonancia que busca resolución— la vida espiritual tiene "intervalos": momentos de
            conflicto que, manejados con gracia, se resuelven en una armonía más rica que la que había
            antes.
          </p>

          <v-row dense class="mb-4">
            <v-col cols="12" md="6">
              <v-card outlined class="pa-4 fill-height" style="border-radius:12px;">
                <div class="d-flex align-center mb-3">
                  <v-icon color="green darken-2" class="mr-2">mdi-check-decagram</v-icon>
                  <h3 class="text-subtitle-1 font-weight-bold green--text text--darken-2">
                    Consonancia espiritual
                  </h3>
                </div>
                <v-list dense>
                  <v-list-item v-for="item in consonances" :key="item" class="px-0 py-1">
                    <v-list-item-icon class="mr-2">
                      <v-icon color="green darken-1" x-small>mdi-music-note</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title class="text-body-2 grey--text text--darken-3 text-wrap">
                        {{ item }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-col>

            <v-col cols="12" md="6">
              <v-card outlined class="pa-4 fill-height" style="border-radius:12px;">
                <div class="d-flex align-center mb-3">
                  <v-icon color="orange darken-2" class="mr-2">mdi-alert-outline</v-icon>
                  <h3 class="text-subtitle-1 font-weight-bold orange--text text--darken-2">
                    Disonancia que busca resolución
                  </h3>
                </div>
                <v-list dense>
                  <v-list-item v-for="item in dissonances" :key="item" class="px-0 py-1">
                    <v-list-item-icon class="mr-2">
                      <v-icon color="orange darken-1" x-small>mdi-music-note-off</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title class="text-body-2 grey--text text--darken-3 text-wrap">
                        {{ item }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-col>
          </v-row>

          <v-card class="pa-5" elevation="2" style="border-radius: 16px; border-left: 5px solid #1976D2;">
            <div class="d-flex align-start">
              <v-icon size="40" color="primary" class="mr-4 mt-1 flex-shrink-0">mdi-guitar-acoustic</v-icon>
              <div>
                <h3 class="text-subtitle-1 font-weight-bold primary--text mb-2">
                  La disonancia no es el final
                </h3>
                <p class="text-body-2 grey--text text--darken-3 mb-3">
                  En la música tonal, una disonancia no es un error; es una tensión que el compositor
                  resuelve intencionalmente. Los mejores momentos musicales a menudo llegan después
                  de una disonancia bien resuelta. El oyente experimenta alivio, belleza y profundidad
                  que no habría sentido sin la tensión previa.
                </p>
                <v-divider class="mb-3" />
                <p class="text-body-2 grey--text text--darken-3 mb-0">
                  Del mismo modo, los conflictos en la iglesia, cuando se entregan a Dios y se resuelven
                  en amor y verdad, pueden producir una unidad más profunda y una armonía más hermosa que
                  la que existía antes del conflicto. El perdón es la "resolución armónica" del Evangelio.
                </p>
              </div>
            </div>
          </v-card>
        </courses-section>

        <!-- SECCIÓN 3: Cómo Cultivar la Armonía -->
        <courses-section outlined title="Cómo Cultivar la Armonía" icon="mdi-sprout-outline" text-class="">
          <p class="text-body-1 grey--text text--darken-3 mb-4">
            La armonía no se improvisa. Se cultiva con hábitos concretos, tanto individuales como
            comunitarios. Pablo en Colosenses 3 da una lista práctica de actitudes que, cuando se
            practican, producen el "sonido" que glorifica a Dios.
          </p>

          <v-row dense class="align-center mb-4">
            <v-col cols="12" md="8">
              <h3 class="text-subtitle-1 font-weight-bold primary--text mb-3">Las "notas" de Colosenses 3</h3>
              <v-row dense>
                <v-col v-for="note in colossians" :key="note.label" cols="12" sm="6">
                  <v-card outlined class="pa-3 mb-2 d-flex align-start" style="border-radius:8px;">
                    <v-icon :color="note.color" class="mr-3 mt-1 flex-shrink-0">{{ note.icon }}</v-icon>
                    <div>
                      <div class="text-subtitle-2 font-weight-bold grey--text text--darken-4">{{ note.label }}</div>
                      <p class="text-caption grey--text text--darken-2 mb-0">{{ note.desc }}</p>
                    </div>
                  </v-card>
                </v-col>
              </v-row>
            </v-col>

            <v-col cols="12" md="4" class="text-center">
              <v-card outlined class="pa-4 fill-height d-flex flex-column justify-center align-center">
                <v-icon size="48" color="primary" class="mb-2">mdi-music-clef-treble</v-icon>
                <div class="text-subtitle-2 font-weight-bold mb-1">La tonalidad del amor</div>
                <p class="text-caption grey--text text--darken-2 mb-0">
                  Pablo llama al amor "el vínculo perfecto" (Col 3:14). En música, la tonalidad es el
                  centro al que todas las notas se refieren. El amor es la tonalidad espiritual que
                  organiza todos los demás dones y virtudes.
                </p>
              </v-card>
            </v-col>
          </v-row>

          <v-alert type="warning" border="left" colored-border elevation="1" class="my-0">
            <div class="text-body-2 font-weight-medium grey--text text--darken-4">
              <strong>Aplicación práctica:</strong> Esta semana, cuando practiques un acorde en tu ukelele,
              escucha con atención si todas las cuerdas suenan con igual claridad. Si alguna se apaga o
              "buzza", corrígela antes de continuar. Haz lo mismo en tus relaciones: si hay algo que
              "suena mal" con un hermano, no lo ignores. Habla con amor, busca la resolución, y devuelve
              la armonía al cuerpo.
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
        { label: "Misericordia", icon: "mdi-hand-heart-outline", color: "pink darken-1", desc: "Ver la necesidad del otro antes que su falta." },
        { label: "Benignidad", icon: "mdi-emoticon-happy-outline", color: "orange darken-1", desc: "Responder con gentileza incluso cuando el ambiente es hostil." },
        { label: "Humildad", icon: "mdi-bow-arrow", color: "blue darken-1", desc: "No insistir en que la melodía del conjunto gire alrededor de tu voz." },
        { label: "Mansedumbre", icon: "mdi-feather", color: "green darken-1", desc: "Fuerza bajo control; dominio propio que protege al más débil." },
        { label: "Paciencia", icon: "mdi-timer-sand", color: "brown darken-1", desc: "Dar tiempo al Espíritu para que trabaje sin forzar resoluciones prematuras." },
        { label: "Perdón", icon: "mdi-peace", color: "purple darken-1", desc: "La resolución armónica definitiva; lo que convierte la disonancia en belleza." },
      ],
    };
  },
};
</script>

<style scoped>
.italic {
  font-style: italic;
}

.w-100 {
  width: 100%;
}

.text-wrap {
  white-space: normal;
}
</style>
