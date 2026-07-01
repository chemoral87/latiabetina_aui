<template>
  <div>
    <courses-header v-model="showContent" title="Teológico - Día 3" />

    <v-expand-transition>
      <div v-if="showContent" class="pa-4">

        <!-- SECCIÓN 1: Un Solo Cuerpo, Muchos Instrumentos -->
        <courses-section outlined title="Un Solo Cuerpo, Muchos Instrumentos" icon="mdi-account-group" text-class="">
          <p class="text-body-1 grey--text text--darken-3 mb-4">
            La Escritura no presenta un solo canal de alabanza como suficiente. Al leer el Salmo 150 como
            el clímax deliberado del Salterio, y 1 Crónicas 15 como relato histórico del culto levítico,
            queda claro que <strong>cada voz, cada timbre y cada registro tiene un lugar irremplazable</strong>
            en la ofrenda congregacional. La diversidad no compite; completa.
          </p>

          <v-row dense class="mb-3">
            <v-col cols="12" md="6" class="d-flex">
              <v-card outlined class="pa-4 grey lighten-5 w-100 d-flex flex-column justify-space-between">
                <div>
                  <div class="d-flex align-center mb-2">
                    <v-icon color="primary" class="mr-2">mdi-book-open-variant</v-icon>
                    <span class="font-weight-bold grey--text text--darken-4">1 Corintios 12:17</span>
                  </div>
                  <p class="text-body-2 italic grey--text text--darken-3 mb-0">
                    "Si todo el cuerpo fuese un ojo, ¿dónde estaría el oído? Si todo fuese el oído,
                    ¿dónde estaría el olfato?"
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
                    <span class="font-weight-bold grey--text text--darken-4">Salmo 150:3-6</span>
                  </div>
                  <p class="text-body-2 italic grey--text text--darken-3 mb-0">
                    "Alabadle a son de bocina… con salterio y arpa… con pandero y danza… con cuerdas y
                    flautas… con címbalos resonantes… Todo lo que respira alabe a JAH."
                  </p>
                </div>
                <div class="text-caption primary--text font-weight-bold mt-2 text-right">RVR1960</div>
              </v-card>
            </v-col>
          </v-row>

          <v-row dense>
            <v-col cols="12" md="4">
              <v-card outlined class="pa-3 fill-height" style="border-radius:10px;">
                <div class="d-flex align-center mb-2">
                  <v-icon color="primary" class="mr-2">mdi-guitar-acoustic</v-icon>
                  <span class="text-subtitle-2 font-weight-bold primary--text">Los instrumentos</span>
                </div>
                <p class="text-body-2 grey--text text--darken-3 mb-0">
                  Salmo 150 no privilegia ningún timbre sobre otro. El ukelele que aprendes a tocar
                  encaja en esa tradición: no es adorno, es voz propia dentro del coro de adoración.
                </p>
              </v-card>
            </v-col>
            <v-col cols="12" md="4">
              <v-card outlined class="pa-3 fill-height" style="border-radius:10px;">
                <div class="d-flex align-center mb-2">
                  <v-icon color="primary" class="mr-2">mdi-account-voice</v-icon>
                  <span class="text-subtitle-2 font-weight-bold primary--text">Las voces graves</span>
                </div>
                <p class="text-body-2 grey--text text--darken-3 mb-0">
                  Dan peso y estabilidad al canto común. Sin ellas la alabanza pierde profundidad. En el
                  templo, hombres y mujeres cantaban juntos: cada registro cumplía su función.
                </p>
              </v-card>
            </v-col>
            <v-col cols="12" md="4">
              <v-card outlined class="pa-3 fill-height" style="border-radius:10px;">
                <div class="d-flex align-center mb-2">
                  <v-icon color="primary" class="mr-2">mdi-account-music</v-icon>
                  <span class="text-subtitle-2 font-weight-bold primary--text">Las voces agudas</span>
                </div>
                <p class="text-body-2 grey--text text--darken-3 mb-0">
                  Aportan luminosidad y júbilo. Miriam y las mujeres de Israel levantaron cantos de
                  victoria (Éx 15:20-21): su participación no era secundaria sino esencial al testimonio.
                </p>
              </v-card>
            </v-col>
          </v-row>
        </courses-section>

        <!-- SECCIÓN 2: La Unidad como Testimonio -->
        <courses-section outlined title="La Unidad como Testimonio" icon="mdi-seal" text-class="">
          <p class="text-body-1 grey--text text--darken-3 mb-4">
            La unidad de la iglesia no es un ideal opcional. Según Jesús, es una de las pruebas más
            poderosas ante el mundo de que el Evangelio es verdadero. En su oración sacerdotal no pidió
            riquezas para sus discípulos, sino que fueran uno, tal como Él y el Padre son uno.
          </p>

          <v-card outlined class="pa-4 grey lighten-5 mb-3">
            <div class="d-flex align-center mb-2">
              <v-icon color="primary" class="mr-2">mdi-book-open-variant</v-icon>
              <span class="font-weight-bold grey--text text--darken-4">Juan 17:21</span>
            </div>
            <p class="text-body-2 italic grey--text text--darken-3 mb-0">
              "Para que todos sean uno; como tú, oh Padre, en mí, y yo en ti, que también ellos sean
              uno en nosotros; para que el mundo crea que tú me enviaste."
            </p>
            <div class="text-caption primary--text font-weight-bold mt-1 text-right">RVR1960</div>
          </v-card>

          <v-alert type="info" border="left" colored-border elevation="1" class="mb-0">
            <div class="text-body-2 font-weight-medium grey--text text--darken-4">
              Pablo vincula la unidad directamente a la adoración: "para que con unánime voz y un solo
              corazón glorifiquéis a Dios" (Ro 15:6). La congregación que canta junta no solo hace música;
              le muestra al mundo que la reconciliación del Evangelio es real.
            </div>
          </v-alert>
        </courses-section>

        <!-- SECCIÓN 3: Aplicación Práctica -->
        <courses-section outlined title="Aplicación Práctica" icon="mdi-hand-pointing-right" text-class="">
          <v-alert type="warning" border="left" colored-border elevation="1" class="mb-0">
            <div class="text-body-2 font-weight-medium grey--text text--darken-4">
              Esta semana, cuando practiques con tu ukelele en la próxima sesión de adoración, nota quién
              canta grave y quién canta agudo. Escúchalos. Deja que tu instrumento sirva al conjunto en
              lugar de destacar sobre él. Luego reflexiona: ¿hay algún miembro del cuerpo a quien tiendes
              a ignorar o ver como prescindible? Ora por esa persona con la misma intención con la que
              afinaste tu instrumento: para que el conjunto suene completo.
            </div>
          </v-alert>
        </courses-section>

      </div>
    </v-expand-transition>
  </div>
</template>

<script>
export default {
  name: "UkeleleTheologicalDay3",
  data() {
    return {
      showContent: true,
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
</style>
