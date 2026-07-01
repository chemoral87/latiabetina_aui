<template>
  <div>
    <courses-header v-model="showContent" title="Teológico - Día 6" />

    <v-expand-transition>
      <div v-if="showContent" class="pa-4">

        <!-- SECCIÓN 1: La Consagración — Separado para Sonar -->
        <courses-section outlined title="La Consagración — Separado para Sonar" icon="mdi-star-circle-outline" text-class="">
          <p class="text-body-1 grey--text text--darken-3 mb-4">
            Un instrumento consagrado es un instrumento apartado. En el AT los levitas y sus instrumentos
            servían en la función para la que habían sido dedicados (1 Cr 15:16-22): eso los definía.
            La consagración del creyente no es un nivel de espiritualidad para pocos elegidos; es la
            vocación de todo aquel redimido por la sangre de Cristo.
          </p>
          <v-row dense class="mb-3">
            <v-col cols="12" md="6" class="d-flex">
              <v-card outlined class="pa-4 grey lighten-5 w-100 d-flex flex-column justify-space-between">
                <div>
                  <div class="d-flex align-center mb-2">
                    <v-icon color="primary" class="mr-2">mdi-book-open-variant</v-icon>
                    <span class="font-weight-bold grey--text text--darken-4">Romanos 12:1</span>
                  </div>
                  <p class="text-body-2 italic grey--text text--darken-3 mb-0">
                    "Que presentéis vuestros cuerpos en sacrificio vivo, santo, agradable a Dios,
                    que es vuestro culto racional."
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
                    <span class="font-weight-bold grey--text text--darken-4">1 Pedro 2:9</span>
                  </div>
                  <p class="text-body-2 italic grey--text text--darken-3 mb-0">
                    "Mas vosotros sois linaje escogido, real sacerdocio, nación santa, pueblo adquirido
                    por Dios, para que anunciéis las virtudes de aquel que os llamó de las tinieblas."
                  </p>
                </div>
                <div class="text-caption primary--text font-weight-bold mt-2 text-right">RVR1960</div>
                <v-divider class="my-2" />
                <p class="text-caption grey--text text--darken-2 mb-0">
                  <strong>Nota exegética:</strong> El <em>basileion hierateuma</em> es plural colectivo:
                  es la identidad corporativa del pueblo, no un privilegio individual. La consagración
                  no aísla al creyente; lo incorpora más profundamente en el cuerpo que adora junto.
                </p>
              </v-card>
            </v-col>
          </v-row>
          <v-alert type="info" border="left" colored-border elevation="1" class="mb-0">
            <div class="text-body-2 font-weight-medium grey--text text--darken-4">
              "Sacrificio vivo" es una paradoja deliberada. En el AT el sacrificio cesaba al morir.
              Pablo invierte la lógica: el creyente <em>permanece</em> sobre el altar porque vive.
              La consagración no es un evento pasado; es una postura presente y continua, renovada
              cada día.
            </div>
          </v-alert>
        </courses-section>

        <!-- SECCIÓN 2: El Instrumento en las Manos del Maestro -->
        <courses-section outlined title="El Instrumento en las Manos del Maestro" icon="mdi-guitar-pick-outline" text-class="">
          <p class="text-body-1 grey--text text--darken-3 mb-4">
            Un ukelele perfectamente afinado pero sin músico permanece en silencio. La consagración
            es el acto por el cual el creyente se pone en las manos de Dios: <em>"Soy tuyo. Tócame.
            Haz sonar en mí lo que tú quieras."</em> El don humano se convierte en vehículo de lo divino.
          </p>

          <v-card outlined class="pa-4 mb-3" style="border-radius:10px; border-left: 4px solid #1976D2;">
            <div class="d-flex align-start">
              <v-icon size="36" color="primary" class="mr-3 mt-1 flex-shrink-0">mdi-account-music-outline</v-icon>
              <div>
                <div class="text-subtitle-2 font-weight-bold primary--text mb-1">2 Timoteo 2:21 — El vaso para honra</div>
                <p class="text-body-2 italic grey--text text--darken-3 mb-2">
                  "Si alguno se limpiare de estas cosas, será instrumento para honra, santificado,
                  útil al Señor, y dispuesto para toda buena obra." — RVR1960
                </p>
                <p class="text-body-2 grey--text text--darken-3 mb-0">
                  La palabra griega es <em>skeuos</em> —"vaso" o "utensilio"—, no instrumento musical;
                  pero la imagen encaja: lo consagrado es lo apartado para uso honorable. "Limpiarse"
                  implica un proceso continuo: cada día eliges orientarte hacia lo que honra a Dios.
                </p>
              </div>
            </div>
          </v-card>

          <v-row dense>
            <v-col v-for="dim in dimensions" :key="dim.label" cols="12" md="6">
              <v-card outlined class="pa-3 mb-2 d-flex align-start" style="border-radius:10px;">
                <v-icon :color="dim.color" size="32" class="mr-3 mt-1 flex-shrink-0">{{ dim.icon }}</v-icon>
                <div>
                  <div class="text-subtitle-2 font-weight-bold grey--text text--darken-4 mb-1">{{ dim.label }}</div>
                  <p class="text-body-2 grey--text text--darken-3 mb-1">{{ dim.desc }}</p>
                  <span class="text-caption primary--text font-weight-bold">{{ dim.verse }}</span>
                  <p class="text-caption italic grey--text text--darken-3 mb-0">{{ dim.verseText }}</p>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </courses-section>

        <!-- SECCIÓN 3: Aplicación Práctica -->
        <courses-section outlined title="Aplicación Práctica" icon="mdi-hand-pointing-right" text-class="">
          <v-alert type="warning" border="left" colored-border elevation="1" class="mb-0">
            <div class="text-body-2 font-weight-medium grey--text text--darken-4">
              Antes de tu próxima sesión de práctica, toma un momento para consagrar ese tiempo a Dios:
              <em>"Señor, este tiempo es tuyo. Este don es tuyo. Que lo que aprendo aquí sea para tu
              gloria y para edificar tu cuerpo."</em> Así como el músico que limpia y afina su
              instrumento antes de tocar, el creyente consagrado cuida su vida espiritual con
              disciplina y amor. La consagración transforma la práctica musical en adoración, y la
              adoración en el fundamento de todo ministerio.
            </div>
          </v-alert>
        </courses-section>

      </div>
    </v-expand-transition>
  </div>
</template>

<script>
export default {
  name: "UkeleleTheologicalDay6",
  data() {
    return {
      showContent: true,
      dimensions: [
        {
          label: "Consagración del cuerpo",
          icon: "mdi-human",
          color: "blue darken-2",
          desc: "Los hábitos físicos —descanso, alimentación, disciplina— son parte de la adoración. El cuerpo que toca el ukelele para Dios debe ser cuidado como el templo que es.",
          verse: "1 Corintios 6:19-20",
          verseText: " — \"Glorificad, pues, a Dios en vuestro cuerpo y en vuestro espíritu.\"",
        },
        {
          label: "Consagración de la mente",
          icon: "mdi-brain",
          color: "purple darken-2",
          desc: "La renovación del entendimiento cambia la manera en que el creyente interpreta la realidad y usa sus capacidades para honrar a Dios.",
          verse: "Romanos 12:2",
          verseText: " — \"Transformaos por medio de la renovación de vuestro entendimiento.\"",
        },
        {
          label: "Consagración del tiempo",
          icon: "mdi-clock-outline",
          color: "orange darken-2",
          desc: "Cada hora es un don de Dios. Ordenar el tiempo con sabiduría significa dar primacía a lo eterno sin abandonar las responsabilidades cotidianas.",
          verse: "Efesios 5:15-16",
          verseText: " — \"Aprovechando bien el tiempo, porque los días son malos.\"",
        },
        {
          label: "Consagración de los dones",
          icon: "mdi-gift-outline",
          color: "green darken-2",
          desc: "El don musical —y cualquier otro don— no fue dado para la autoexaltación sino para la edificación del cuerpo de Cristo y la gloria de Dios.",
          verse: "1 Pedro 4:10",
          verseText: " — \"Minístrelo a los otros, como buenos administradores de la multiforme gracia de Dios.\"",
        },
      ],
    };
  },
};
</script>

<style scoped>
.italic { font-style: italic; }
.w-100 { width: 100%; }
</style>
