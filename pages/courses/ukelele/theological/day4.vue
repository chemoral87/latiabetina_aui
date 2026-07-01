<template>
  <div>
    <courses-header v-model="showContent" title="Teológico - Día 4" />

    <v-expand-transition>
      <div v-if="showContent" class="pa-4">

        <!-- SECCIÓN 1: La Alabanza como Cénit de la Unidad -->
        <courses-section outlined title="La Alabanza como Cénit de la Unidad" icon="mdi-account-group-outline" text-class="">
          <p class="text-body-1 grey--text text--darken-3 mb-4">
            En ningún otro momento de la vida eclesial el cuerpo de Cristo actúa tan unido como cuando
            alaba: todos pronuncian las mismas palabras, siguen la misma melodía y orientan su afecto
            hacia el mismo Señor. La alabanza congregacional no borra las diferencias, pero las subordina
            a algo más grande: <strong>glorificar a Dios con una sola voz y un solo corazón</strong>.
          </p>

          <v-row dense class="mb-3">
            <v-col cols="12" md="6" class="d-flex">
              <v-card outlined class="pa-4 grey lighten-5 w-100 d-flex flex-column justify-space-between">
                <div>
                  <div class="d-flex align-center mb-2">
                    <v-icon color="primary" class="mr-2">mdi-book-open-variant</v-icon>
                    <span class="font-weight-bold grey--text text--darken-4">Romanos 15:5-6</span>
                  </div>
                  <p class="text-body-2 italic grey--text text--darken-3 mb-0">
                    "El Dios de paciencia y de consolación os conceda que entre vosotros seáis unánimes
                    conforme a Cristo Jesús, para que con unánime voz y un solo corazón glorifiquéis al
                    Dios y Padre de nuestro Señor Jesucristo."
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
                    <span class="font-weight-bold grey--text text--darken-4">Colosenses 3:16</span>
                  </div>
                  <p class="text-body-2 italic grey--text text--darken-3 mb-0">
                    "Enseñándoos y exhortándoos unos a otros con salmos, con himnos y cánticos
                    espirituales, cantando con gracia en vuestros corazones al Señor."
                  </p>
                </div>
                <div class="text-caption primary--text font-weight-bold mt-2 text-right">RVR1960</div>
              </v-card>
            </v-col>
          </v-row>

          <v-row dense>
            <v-col cols="12" md="4">
              <v-card outlined class="pa-3 text-center fill-height" style="border-radius:10px;">
                <v-icon color="primary" class="mb-1">mdi-text-box-outline</v-icon>
                <div class="text-subtitle-2 font-weight-bold primary--text mb-1">Una misma letra</div>
                <p class="text-body-2 grey--text text--darken-3 mb-0">
                  El himno o salmo es un credo cantado: une doctrina y devoción en una sola boca,
                  sin importar la clase o la edad de quien lo canta.
                </p>
              </v-card>
            </v-col>
            <v-col cols="12" md="4">
              <v-card outlined class="pa-3 text-center fill-height" style="border-radius:10px;">
                <v-icon color="primary" class="mb-1">mdi-tune</v-icon>
                <div class="text-subtitle-2 font-weight-bold primary--text mb-1">Una misma melodía</div>
                <p class="text-body-2 grey--text text--darken-3 mb-0">
                  Cada voz suena en altura distinta, pero converge en el mismo canto. El ukelele
                  no impone su melodía: sirve al bien del conjunto (2 Cr 5:13).
                </p>
              </v-card>
            </v-col>
            <v-col cols="12" md="4">
              <v-card outlined class="pa-3 text-center fill-height" style="border-radius:10px;">
                <v-icon color="primary" class="mb-1">mdi-heart-outline</v-icon>
                <div class="text-subtitle-2 font-weight-bold primary--text mb-1">Un mismo sentir</div>
                <p class="text-body-2 grey--text text--darken-3 mb-0">
                  Pablo pide afecto común, no solo palabras iguales: "sintiendo lo mismo, teniendo
                  el mismo amor, unánimes" (Fil 2:2).
                </p>
              </v-card>
            </v-col>
          </v-row>
        </courses-section>

        <!-- SECCIÓN 2: Pentecostés: La Unanimidad que Precedió al Espíritu -->
        <courses-section outlined title="Pentecostés: La Unanimidad que Precedió al Espíritu" icon="mdi-fire" text-class="">
          <p class="text-body-1 grey--text text--darken-3 mb-4">
            La Escritura registra algo que suele pasarse por alto antes del derramamiento del Espíritu:
            <strong>todos estaban unánimes en un mismo lugar</strong>. La unanimidad no fue la consecuencia
            del avivamiento, sino el <em>contexto en el que</em> Dios, soberanamente, eligió actuar.
            Hechos 1:14-15 detalla que los días previos los discípulos —un grupo de unas 120 personas—
            "perseveraban unánimes en oración y ruego". No fue una reunión improvisada; fue una comunidad
            que sostuvo el acuerdo durante diez días hasta que el Espíritu lo convirtió en fuego sobre
            cada cabeza. Este patrón ya estaba en el AT: cuando el pueblo cantó unánime en la dedicación
            del templo, la gloria de Dios descendió y llenó el lugar (2 Cr 5:13-14).
          </p>

          <v-row dense class="mb-3">
            <v-col cols="12" md="6" class="d-flex">
              <v-card outlined class="pa-4 orange lighten-5 w-100 d-flex flex-column justify-space-between">
                <div>
                  <div class="d-flex align-center mb-2">
                    <v-icon color="orange darken-3" class="mr-2">mdi-book-open-variant</v-icon>
                    <span class="font-weight-bold orange--text text--darken-3">Hechos 2:1-4</span>
                  </div>
                  <p class="text-body-2 italic grey--text text--darken-3 mb-0">
                    "Cuando llegó el día de Pentecostés, estaban todos <strong>unánimes juntos</strong>…
                    y fueron todos llenos del Espíritu Santo."
                  </p>
                </div>
                <div class="text-caption orange--text text--darken-3 font-weight-bold mt-2 text-right">RVR1960</div>
              </v-card>
            </v-col>
            <v-col cols="12" md="6" class="d-flex">
              <v-card outlined class="pa-4 amber lighten-5 w-100 d-flex flex-column justify-space-between">
                <div>
                  <div class="d-flex align-center mb-2">
                    <v-icon color="amber darken-3" class="mr-2">mdi-book-open-variant</v-icon>
                    <span class="font-weight-bold amber--text text--darken-3">2 Crónicas 5:13-14</span>
                  </div>
                  <p class="text-body-2 italic grey--text text--darken-3 mb-0">
                    "Cuando unían sus voces… al unísono alzaban la voz… entonces la casa se llenó de
                    una nube… porque la gloria de Jehová había llenado la casa de Dios."
                  </p>
                </div>
                <div class="text-caption amber--text text--darken-3 font-weight-bold mt-2 text-right">RVR1960</div>
              </v-card>
            </v-col>
          </v-row>

          <v-row dense>
            <v-col cols="12" md="4">
              <v-card outlined class="pa-3 text-center fill-height" style="border-radius:10px;">
                <v-icon color="deep-orange" class="mb-1">mdi-account-group</v-icon>
                <div class="text-subtitle-2 font-weight-bold deep-orange--text mb-1">Estaban todos</div>
                <p class="text-body-2 grey--text text--darken-3 mb-0">
                  Hechos 1:15 cuenta que eran unas 120 personas. No los más espirituales, sino el grupo
                  completo: los doce, las mujeres, la familia de Jesús. La unanimidad exige que nadie
                  se excuse ni se aparte del lugar de la espera.
                </p>
              </v-card>
            </v-col>
            <v-col cols="12" md="4">
              <v-card outlined class="pa-3 text-center fill-height" style="border-radius:10px;">
                <v-icon color="deep-orange" class="mb-1">mdi-handshake-outline</v-icon>
                <div class="text-subtitle-2 font-weight-bold deep-orange--text mb-1">Unánimes</div>
                <p class="text-body-2 grey--text text--darken-3 mb-0">
                  <em>Homothumadón</em> —"de un mismo ánimo"— implica querer lo mismo y apuntar
                  al mismo Señor con el corazón alineado.
                </p>
              </v-card>
            </v-col>
            <v-col cols="12" md="4">
              <v-card outlined class="pa-3 text-center fill-height" style="border-radius:10px;">
                <v-icon color="deep-orange" class="mb-1">mdi-map-marker-outline</v-icon>
                <div class="text-subtitle-2 font-weight-bold deep-orange--text mb-1">En un mismo lugar</div>
                <p class="text-body-2 grey--text text--darken-3 mb-0">
                  La presencia física compartida importa. El Espíritu vino sobre una comunidad que
                  eligió congregarse, no dispersarse.
                </p>
              </v-card>
            </v-col>
          </v-row>
        </courses-section>

        <!-- SECCIÓN 3: Aplicación Práctica -->
        <courses-section outlined title="Aplicación Práctica" icon="mdi-hand-pointing-right" text-class="">
          <v-alert type="warning" border="left" colored-border elevation="1" class="mb-0">
            <div class="text-body-2 font-weight-medium grey--text text--darken-4">
              La próxima vez que cantes en congregación o acompañes con tu ukelele, recuerda que
              participas en algo más antiguo que tú: el patrón del canto unánime que en el templo trajo
              la nube de gloria y en el aposento alto trajo el fuego del Espíritu. No estás ejecutando
              una pieza; estás contribuyendo al clima en el que Dios elige manifestarse. Afina tu
              instrumento, alinea tu corazón y elige, como los 120, estar presente y unánime.
            </div>
          </v-alert>
        </courses-section>

      </div>
    </v-expand-transition>
  </div>
</template>

<script>
export default {
  name: "UkeleleTheologicalDay4",
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
.text-wrap {
  white-space: normal;
}
</style>
