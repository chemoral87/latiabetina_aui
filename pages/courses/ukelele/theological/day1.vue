<template>
  <div>
    <courses-header v-model="showContent" title="Teológico - Día 1" />

    <v-expand-transition>
      <div v-if="showContent" class="pa-4">
        <!-- SECCIÓN 1: La Alabanza y los Instrumentos -->
        <courses-section outlined title="La Alabanza y los Instrumentos" icon="mdi-music-clef-treble" text-class="">
          <p class="text-body-1 grey--text text--darken-3 mb-4">
            A lo largo de las Escrituras, vemos que la música y los instrumentos musicales juegan un papel fundamental en la adoración a Dios. No son simples acompañamientos decorativos, sino canales a través de los cuales expresamos júbilo, gratitud y reverencia al Creador.
          </p>

          <v-row dense>
            <v-col cols="12" md="4" class="d-flex">
              <v-card outlined class="pa-4 grey lighten-5 w-100 d-flex flex-column justify-space-between">
                <div>
                  <div class="d-flex align-center mb-2">
                    <v-icon color="primary" class="mr-2">mdi-book-open-variant</v-icon>
                    <span class="font-weight-bold grey--text text--darken-4">Salmo 150:3-5</span>
                  </div>
                  <p class="text-body-2 italic grey--text text--darken-3 mb-0">
                    "Alabadle a son de bocina; Alabadle con salterio y arpa. Alabadle con pandero y danza; Alabadle con cuerdas y flautas. Alabadle con címbalos resonantes; Alabadle con címbalos de júbilo."
                  </p>
                </div>
                <div class="text-caption primary--text font-weight-bold mt-2 text-right">RVR1960</div>
              </v-card>
            </v-col>

            <v-col cols="12" md="4" class="d-flex">
              <v-card outlined class="pa-4 grey lighten-5 w-100 d-flex flex-column justify-space-between">
                <div>
                  <div class="d-flex align-center mb-2">
                    <v-icon color="primary" class="mr-2">mdi-book-open-variant</v-icon>
                    <span class="font-weight-bold grey--text text--darken-4">Salmo 33:2-3</span>
                  </div>
                  <p class="text-body-2 italic grey--text text--darken-3 mb-0">
                    "Alabad a Jehová con arpa; Cantadle con salterio y decacordio. Cantadle cántico nuevo; Hacedlo bien, tañendo con júbilo."
                  </p>
                </div>
                <div class="text-caption primary--text font-weight-bold mt-2 text-right">RVR1960</div>
              </v-card>
            </v-col>

            <v-col cols="12" md="4" class="d-flex">
              <v-card outlined class="pa-4 grey lighten-5 w-100 d-flex flex-column justify-space-between">
                <div>
                  <div class="d-flex align-center mb-2">
                    <v-icon color="primary" class="mr-2">mdi-book-open-variant</v-icon>
                    <span class="font-weight-bold grey--text text--darken-4">Efesios 5:19</span>
                  </div>
                  <p class="text-body-2 italic grey--text text--darken-3 mb-0">
                    "hablando entre vosotros con salmos, con himnos y cánticos espirituales, cantando y alabando al Señor en vuestros corazones;"
                  </p>
                </div>
                <div class="text-caption primary--text font-weight-bold mt-2 text-right">RVR1960</div>
              </v-card>
            </v-col>
          </v-row>

          <!-- Galería de Instrumentos Bíblicos -->
          <div class="mt-6">
            <h3 class="text-subtitle-1 font-weight-bold grey--text text--darken-3 mb-3 d-flex align-center">
              <v-icon color="primary" class="mr-2">mdi-image-multiple</v-icon>
              Instrumentos mencionados en las Escrituras
            </h3>
            <v-row dense justify="center">
              <v-col cols="6" sm="4" md="2" v-for="instrumento in instrumentos" :key="instrumento.nombre" class="d-flex">
                <v-card
                  outlined
                  class="pa-3 text-center w-100 instrument-card"
                  style="border-radius:12px; transition: all 0.25s ease;"
                >
                  <v-img
                    :src="instrumento.imagen"
                    :alt="instrumento.nombre"
                    height="110"
                    contain
                    class="mb-2"
                  />
                  <div class="text-caption font-weight-bold grey--text text--darken-3">{{ instrumento.nombre }}</div>
                  <div class="text-caption grey--text text--darken-1">{{ instrumento.referencia }}</div>
                </v-card>
              </v-col>
            </v-row>
          </div>
        </courses-section>

        <!-- SECCIÓN 2: ¿Existe la Música Cristiana? -->
        <courses-section outlined title="¿Existe la Música Cristiana?" icon="mdi-help-circle-outline" text-class="">
          <p class="text-body-1 grey--text text--darken-3 mb-4">
            Frecuentemente se clasifica la música en categorías como "cristiana" o "secular". Sin embargo, desde una perspectiva estrictamente técnica y bíblica, <strong>la música en sí misma no tiene religión</strong>.
          </p>

          <v-row dense class="mb-4">
            <v-col cols="12" md="6">
              <v-card flat class="pa-2">
                <h3 class="text-subtitle-1 font-weight-bold primary--text mb-2">La neutralidad del sonido</h3>
                <p class="text-body-2 grey--text text--darken-3">
                  Una nota musical (como un Do o un Sol), una escala mayor o una progresión de acordes son leyes físicas de la acústica y frecuencias creadas por Dios al fundar el universo. El sonido y la teoría musical son inherentemente neutrales; no existen las "notas cristianas" ni los "ritmos pecaminosos".
                </p>
              </v-card>
            </v-col>
            <v-col cols="12" md="6">
              <v-card flat class="pa-2">
                <h3 class="text-subtitle-1 font-weight-bold primary--text mb-2">La letra y la intención del corazón</h3>
                <p class="text-body-2 grey--text text--darken-3">
                  Lo que verdaderamente define y santifica a una canción es <strong>su mensaje y el propósito del corazón</strong> que la ejecuta. Son las letras inspiradas en la Palabra, que exaltan, confiesan y dan gloria a Dios, junto con una actitud sincera del adorador, las que transforman el sonido en una ofrenda de olor fragante ante Su altar.
                </p>
              </v-card>
            </v-col>
          </v-row>

          <v-alert type="info" border="left" colored-border elevation="1" class="mb-6">
            <div class="text-body-2 font-weight-medium grey--text text--darken-4">
              "El ukelele que tienes en tus manos es un instrumento neutral. Al aprender acordes y ritmos, estás dominando la creación de Dios. Es la intención de tu corazón y la letra de tus cantos lo que convertirá tu práctica en adoración verdadera."
            </div>
          </v-alert>

          <!-- Analogía del Cuchillo -->
          <v-card class="knife-analogy-card pa-5" elevation="2" style="border-radius: 16px; border-left: 5px solid #FF6F00;">
            <div class="d-flex align-start">
              <v-icon size="40" color="orange darken-3" class="mr-4 mt-1 flex-shrink-0">mdi-knife</v-icon>
              <div>
                <h3 class="text-subtitle-1 font-weight-bold orange--text text--darken-3 mb-2">
                  Analogía: El cuchillo
                </h3>
                <p class="text-body-2 grey--text text--darken-3 mb-3">
                  Piensa en un cuchillo de cocina. En manos de una madre, sirve para cortar verduras, preparar el alimento y nutrir a su familia.
                  Ese mismo cuchillo, en otras circunstancias, puede usarse para herir o lastimar.
                </p>
                <p class="text-body-2 grey--text text--darken-3 mb-3">
                  ¿Es el cuchillo bueno o malo? <strong>El objeto en sí es neutral.</strong>
                  Lo que determina su resultado es <strong>quién lo sostiene, con qué intención y hacia qué propósito</strong>.
                </p>
                <v-divider class="mb-3" />
                <p class="text-body-2 grey--text text--darken-3 mb-0">
                  La música funciona exactamente igual. Un acorde de Sol mayor puede acompañar un himno de adoración que lleva a una congregación a los pies de Dios,
                  o puede acompañar una letra que destruye, envilece o aleja del Creador.
                  <strong>No hay música cristiana ni música secular: hay letras e intenciones que exaltan a Dios, y letras e intenciones que no lo hacen.</strong>
                </p>
              </div>
            </div>
          </v-card>
        </courses-section>

        <!-- SECCIÓN 3: La Importancia de la Disciplina -->
        <courses-section outlined title="La Importancia de la Disciplina" icon="mdi-seal" text-class="">
          <p class="text-body-1 grey--text text--darken-3 mb-4">
            Desarrollar una habilidad musical requiere perseverancia, práctica y paciencia. En la Biblia, la disciplina y la excelencia técnica no se oponen a la espiritualidad, sino que caminan de la mano para servir a Dios con lo mejor de nosotros.
          </p>

          <v-row dense class="align-center mb-4">
            <v-col cols="12" md="8">
              <h3 class="text-subtitle-1 font-weight-bold primary--text mb-2">David tocando el arpa para Saúl</h3>
              <p class="text-body-2 grey--text text--darken-3 mb-3">
                Cuando el rey Saúl era atormentado por un espíritu malo, sus sirvientes buscaron a alguien que supiera tocar bien. Encontraron a David, quien no solo tenía el respaldo de Dios, sino que era sumamente dedicado a su instrumento.
              </p>
              <v-card outlined class="pa-4 grey lighten-5 mb-3">
                <div class="d-flex align-center mb-2">
                  <v-icon color="primary" class="mr-2">mdi-book-open-variant</v-icon>
                  <span class="font-weight-bold grey--text text--darken-4">1 Samuel 16:23</span>
                </div>
                <p class="text-body-2 italic grey--text text--darken-3 mb-0">
                  "Y cuando el espíritu malo de parte de Dios venía sobre Saúl, David tomaba el arpa y la tocaba con su mano; y Saúl tenía alivio y estaba mejor, y el espíritu malo se apartaba de él."
                </p>
                <div class="text-caption primary--text font-weight-bold mt-1 text-right">RVR1960</div>
              </v-card>
            </v-col>

            <v-col cols="12" md="4" class="text-center">
              <v-card outlined class="pa-4 fill-height d-flex flex-column justify-center align-center">
                <v-icon size="48" color="amber darken-2" class="mb-2">mdi-music</v-icon>
                <div class="text-subtitle-2 font-weight-bold mb-1">"Tañendo con júbilo"</div>
                <p class="text-caption grey--text text--darken-2 mb-0">
                  David no tocaba de manera improvisada; su destreza en el arpa era fruto de horas de cuidado de las ovejas y práctica silenciosa, capacitando su talento para ser un canal de paz y liberación espiritual.
                </p>
              </v-card>
            </v-col>
          </v-row>

          <v-alert type="warning" border="left" colored-border elevation="1" class="my-0">
            <div class="text-body-2 font-weight-medium grey--text text--darken-4">
              <strong>El llamado a la excelencia:</strong> Así como el rey David, la práctica diaria del ukelele es un acto de disciplina y respeto hacia Dios. Estudiar teoría musical y practicar digitación es preparar una ofrenda digna para nuestro Creador.
            </div>
          </v-alert>
        </courses-section>
      </div>
    </v-expand-transition>
  </div>
</template>

<script>
export default {
  name: "UkeleleTheologicalDay1",
  data() {
    return {
      showContent: true,
      instrumentos: [
        {
          nombre: 'Címbalo',
          imagen: '/courses/ukelele/images/cimbalo.png',
          referencia: 'Salmo 150:5'
        },
        {
          nombre: 'Pandero',
          imagen: '/courses/ukelele/images/pandero.png',
          referencia: 'Salmo 150:4'
        },
        {
          nombre: 'Salterio',
          imagen: '/courses/ukelele/images/salterio.png',
          referencia: 'Salmo 33:2'
        },
        {
          nombre: 'Arpa',
          imagen: '/courses/ukelele/images/arpa.png',
          referencia: 'Salmo 33:2'
        },
        {
          nombre: 'Decacordio',
          imagen: '/courses/ukelele/images/decacordio.png',
          referencia: 'Salmo 33:2'
        },
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
.instrument-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  border-color: #1976d2 !important;
}
</style>