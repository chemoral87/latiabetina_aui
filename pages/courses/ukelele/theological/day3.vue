<template>
  <div>
    <courses-header v-model="showContent" title="Teológico - Día 3" />

    <v-expand-transition>
      <div v-if="showContent" class="pa-4">
        <!-- SECCIÓN 1: Un Solo Cuerpo, Muchos Instrumentos -->
        <courses-section outlined title="Un Solo Cuerpo, Muchos Instrumentos" icon="mdi-account-group" text-class="">
          <p class="text-body-1 grey--text text--darken-3 mb-4">
            Así como un acorde no nace de una sola cuerda sino de varias notas distintas sonando juntas en
            perfecta proporción, la Iglesia no es una voz solitaria, sino un cuerpo compuesto por muchos
            miembros diferentes que, unidos, producen una sola alabanza agradable a Dios.
          </p>

          <v-row dense>
            <v-col cols="12" md="6" class="d-flex">
              <v-card outlined class="pa-4 grey lighten-5 w-100 d-flex flex-column justify-space-between">
                <div>
                  <div class="d-flex align-center mb-2">
                    <v-icon color="primary" class="mr-2">mdi-book-open-variant</v-icon>
                    <span class="font-weight-bold grey--text text--darken-4">1 Corintios 12:12</span>
                  </div>
                  <p class="text-body-2 italic grey--text text--darken-3 mb-0">
                    "Porque así como el cuerpo es uno, y tiene muchos miembros, pero todos los miembros del
                    cuerpo, siendo muchos, son un solo cuerpo, así también Cristo."
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
                    <span class="font-weight-bold grey--text text--darken-4">Salmo 133:1</span>
                  </div>
                  <p class="text-body-2 italic grey--text text--darken-3 mb-0">
                    "Mirad cuán bueno y cuán delicioso es habitar los hermanos juntos en armonía."
                  </p>
                </div>
                <div class="text-caption primary--text font-weight-bold mt-2 text-right">RVR1960</div>
              </v-card>
            </v-col>
          </v-row>

          <v-alert type="info" border="left" colored-border elevation="1" class="mt-2 mb-0">
            <div class="text-body-2 font-weight-medium grey--text text--darken-4">
              La palabra "armonía" en el Salmo 133 describe exactamente lo que ocurre cuando varias notas
              distintas —como el Do, el Mi y el Sol de un acorde mayor— suenan al mismo tiempo sin
              chocar entre sí, sino complementándose. La unidad de la Iglesia funciona igual: personas
              diferentes, dones diferentes, voces diferentes, unidas en un mismo propósito.
            </div>
          </v-alert>
        </courses-section>

        <!-- SECCIÓN 2: La Analogía del Acorde -->
        <courses-section outlined title="La Analogía del Acorde" icon="mdi-guitar-pick-outline" text-class="">
          <p class="text-body-1 grey--text text--darken-3 mb-4">
            En la teoría musical aprendimos que un acorde mayor se construye con tres notas distintas: la
            tónica, la tercera y la quinta. Ninguna de esas notas, tocada sola, produce el mismo efecto
            que las tres juntas. Esta verdad musical refleja un principio espiritual profundo sobre la
            vida en comunidad.
          </p>

          <v-row dense class="mb-4">
            <v-col cols="12" md="4">
              <v-card outlined class="pa-4 text-center fill-height" style="border-radius:12px;">
                <v-icon size="40" color="primary" class="mb-2">mdi-numeric-1-circle-outline</v-icon>
                <h3 class="text-subtitle-1 font-weight-bold primary--text mb-2">Una sola nota</h3>
                <p class="text-body-2 grey--text text--darken-3 mb-0">
                  Un Do solo, por más afinado que esté, es apenas un tono. Tiene valor, pero le falta
                  riqueza. Así también un creyente aislado, por más dones que tenga, no fue diseñado para
                  vivir ni servir solo.
                </p>
              </v-card>
            </v-col>

            <v-col cols="12" md="4">
              <v-card outlined class="pa-4 text-center fill-height" style="border-radius:12px;">
                <v-icon size="40" color="primary" class="mb-2">mdi-numeric-3-circle-outline</v-icon>
                <h3 class="text-subtitle-1 font-weight-bold primary--text mb-2">Tres notas distintas</h3>
                <p class="text-body-2 grey--text text--darken-3 mb-0">
                  Do, Mi y Sol no son iguales entre sí; cada una vibra a su propia frecuencia. Pero
                  precisamente por ser distintas y estar correctamente ordenadas, al sonar juntas generan
                  un acorde mayor: pleno, estable y agradable al oído.
                </p>
              </v-card>
            </v-col>

            <v-col cols="12" md="4">
              <v-card outlined class="pa-4 text-center fill-height" style="border-radius:12px;">
                <v-icon size="40" color="primary" class="mb-2">mdi-handshake-outline</v-icon>
                <h3 class="text-subtitle-1 font-weight-bold primary--text mb-2">Un cuerpo, muchos dones</h3>
                <p class="text-body-2 grey--text text--darken-3 mb-0">
                  En la iglesia, el que predica, el que sirve, el que canta y el que toca un instrumento
                  no compiten entre sí. Cada don, en su lugar correcto, suma a una sola alabanza que honra
                  a Dios.
                </p>
              </v-card>
            </v-col>
          </v-row>

          <v-card class="knife-analogy-card pa-5" elevation="2"
            style="border-radius: 16px; border-left: 5px solid #1976D2;">
            <div class="d-flex align-start">
              <v-icon size="40" color="primary" class="mr-4 mt-1 flex-shrink-0">mdi-music-note-plus</v-icon>
              <div>
                <h3 class="text-subtitle-1 font-weight-bold primary--text mb-2">
                  Cuando una nota desafina, el acorde se rompe
                </h3>
                <p class="text-body-2 grey--text text--darken-3 mb-3">
                  Basta con que una sola cuerda del ukelele esté desafinada para que todo el acorde suene
                  mal, aunque las otras dos estén perfectas. No hace falta que las tres cuerdas estén mal
                  afinadas; con una sola es suficiente para romper la armonía de todo el conjunto.
                </p>
                <v-divider class="mb-3" />
                <p class="text-body-2 grey--text text--darken-3 mb-0">
                  Lo mismo ocurre en la Iglesia: la falta de perdón, el orgullo, la murmuración o la
                  división de un solo miembro pueden desafinar la unidad de toda la congregación. Por eso
                  Pablo nos exhorta a "guardar la unidad del Espíritu en el vínculo de la paz"
                  (Efesios 4:3): cada creyente tiene la responsabilidad de mantener afinada su propia
                  cuerda para no romper el acorde común.
                </p>
              </div>
            </div>
          </v-card>
        </courses-section>

        <!-- SECCIÓN 3: La Unidad como Testimonio -->
        <courses-section outlined title="La Unidad como Testimonio" icon="mdi-seal" text-class="">
          <p class="text-body-1 grey--text text--darken-3 mb-4">
            La unidad de la iglesia no es solo un ideal agradable; es un mandato y, según Jesús mismo, una
            de las pruebas más poderosas ante el mundo de que el Evangelio es verdadero.
          </p>

          <v-row dense class="align-center mb-4">
            <v-col cols="12" md="8">
              <h3 class="text-subtitle-1 font-weight-bold primary--text mb-2">La oración de Jesús por la unidad</h3>
              <p class="text-body-2 grey--text text--darken-3 mb-3">
                En su oración antes de la cruz, Jesús no pidió por riquezas ni por comodidad para sus
                discípulos. Pidió, sobre todo, que fueran uno, tal como Él y el Padre son uno, para que el
                mundo creyera.
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
            </v-col>

            <v-col cols="12" md="4" class="text-center">
              <v-card outlined class="pa-4 fill-height d-flex flex-column justify-center align-center">
                <v-icon size="48" color="amber darken-2" class="mb-2">mdi-account-multiple-check-outline</v-icon>
                <div class="text-subtitle-2 font-weight-bold mb-1">"Solícitos en guardar la unidad"</div>
                <p class="text-caption grey--text text--darken-2 mb-0">
                  Efesios 4:2-3 nos llama a la humildad, mansedumbre, paciencia y amor como las "cuerdas"
                  que mantienen afinada la unidad del cuerpo de Cristo.
                </p>
              </v-card>
            </v-col>
          </v-row>

          <v-alert type="warning" border="left" colored-border elevation="1" class="my-0">
            <div class="text-body-2 font-weight-medium grey--text text--darken-4">
              <strong>Aplicación práctica:</strong> Cuando tocas un acorde mayor en tu ukelele, recuerda que
              cada cuerda debe estar afinada y debe sonar en su lugar correcto, sin opacar a las demás,
              para que el resultado sea hermoso. Sirve en la iglesia con esa misma actitud: usa tu don sin
              competir, afina tu corazón en humildad, y suma tu voz a la armonía del cuerpo de Cristo.
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
