<template>
  <div>
    <courses-header v-model="showContent" title="Teológico - Día 4" />

    <v-expand-transition>
      <div v-if="showContent" class="pa-4">
        <!-- SECCIÓN 1: La Alabanza como Cénit de la Unidad -->
        <courses-section outlined title="La Alabanza como Cénit de la Unidad" icon="mdi-account-group-outline" text-class="">
          <p class="text-body-1 grey--text text--darken-3 mb-4">
            En la vida cotidiana de la iglesia conviven diferencias reales: edades, dones, temperamentos,
            historias y opiniones. Sin embargo, existe un momento donde esas diferencias ceden ante algo
            más grande: <strong>la alabanza congregacional es uno de los instantes de mayor unidad del
            cuerpo de Cristo</strong>. No porque desaparezcan las diferencias, sino porque, al adorar
            juntos, el pueblo declara con una sola voz la misma verdad, la misma melodía y el mismo
            sentir hacia Dios.
          </p>

          <v-row dense>
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
                    <span class="font-weight-bold grey--text text--darken-4">Salmo 95:1-2</span>
                  </div>
                  <p class="text-body-2 italic grey--text text--darken-3 mb-0">
                    "Venid, celebremos alegremente a Jehová; Cantemos con júbilo a la roca de nuestra
                    salvación. Lleguemos ante su presencia con alabanza; Aclamémosle con cánticos."
                  </p>
                </div>
                <div class="text-caption primary--text font-weight-bold mt-2 text-right">RVR1960</div>
              </v-card>
            </v-col>
          </v-row>

          <v-alert type="info" border="left" colored-border elevation="1" class="mt-2 mb-0">
            <div class="text-body-2 font-weight-medium grey--text text--darken-4">
              Leer estos pasajes en contexto revela un patrón: la unidad no se anuncia solo como ideal
              doctrinal, sino que se <em>encarna</em> cuando el pueblo entra junto en adoración. Allí,
              ricos y pobres, jóvenes y ancianos, músicos y no músicos convergen en una sola acción:
              glorificar a Dios con la misma palabra y el mismo corazón.
            </div>
          </v-alert>
        </courses-section>

        <!-- SECCIÓN 2: Una misma letra, un mismo tono, un mismo sentir -->
        <courses-section outlined title="Una misma letra, una misma melodía, un mismo sentir" icon="mdi-music-note-multiple" text-class="">
          <p class="text-body-1 grey--text text--darken-3 mb-4">
            Cuando una congregación canta, ocurre algo que rara vez sucede en otras actividades
            eclesiales: <strong>todos pronuncian las mismas palabras al mismo tiempo</strong>, siguen la
            misma melodía y orientan su afecto hacia el mismo Señor. Es como un acorde donde cada cuerda
            del ukelele vibra en distinta frecuencia, pero todas responden a la misma afinación y producen
            un solo sonido. La alabanza congregacional condensa la unidad en tres dimensiones simultáneas.
          </p>

          <v-row dense class="mb-4">
            <v-col cols="12" md="4">
              <v-card outlined class="pa-4 text-center fill-height" style="border-radius:12px;">
                <v-icon size="40" color="primary" class="mb-2">mdi-text-box-outline</v-icon>
                <h3 class="text-subtitle-1 font-weight-bold primary--text mb-2">Una misma letra</h3>
                <p class="text-body-2 grey--text text--darken-3 mb-3">
                  En la alabanza, ricos y pobres, instruidos y sencillos, declaran la misma verdad con las
                  mismas palabras. No hay discurso alterno ni mensaje privado: el himno o salmo es un
                  credo cantado que une doctrina y devoción en una sola boca.
                </p>
                <v-card outlined class="pa-3 grey lighten-5 text-left">
                  <div class="d-flex align-center mb-1">
                    <v-icon color="primary" small class="mr-2">mdi-book-open-variant</v-icon>
                    <span class="text-caption font-weight-bold grey--text text--darken-4">Colosenses 3:16</span>
                  </div>
                  <p class="text-body-2 italic grey--text text--darken-3 mb-0">
                    "Enseñándoos y exhortándoos unos a otros con salmos, con himnos y cánticos
                    espirituales, cantando con gracia en vuestros corazones al Señor."
                  </p>
                </v-card>
              </v-card>
            </v-col>

            <v-col cols="12" md="4">
              <v-card outlined class="pa-4 text-center fill-height" style="border-radius:12px;">
                <v-icon size="40" color="primary" class="mb-2">mdi-tune</v-icon>
                <h3 class="text-subtitle-1 font-weight-bold primary--text mb-2">Una misma melodía</h3>
                <p class="text-body-2 grey--text text--darken-3 mb-3">
                  Cantar juntos exige escuchar al conjunto y ajustarse a una misma tonalidad y melodía.
                  Cada registro vocal suena en altura distinta, pero converge en el mismo canto. El ukelele
                  que acompaña no impone su propia melodía: sirve al canto común. Así también, en la
                  alabanza cada voz se somete al bien del todo, buscando unísono y armonía antes que
                  brillar por separado.
                </p>
                <v-card outlined class="pa-3 grey lighten-5 text-left">
                  <div class="d-flex align-center mb-1">
                    <v-icon color="primary" small class="mr-2">mdi-book-open-variant</v-icon>
                    <span class="text-caption font-weight-bold grey--text text--darken-4">2 Crónicas 5:13</span>
                  </div>
                  <p class="text-body-2 italic grey--text text--darken-3 mb-0">
                    "Cuando unían sus voces alabando y dando gracias a Jehová… al unísono alzaban la voz
                    con trompetas, con címbalos y con instrumentos de música."
                  </p>
                </v-card>
              </v-card>
            </v-col>

            <v-col cols="12" md="4">
              <v-card outlined class="pa-4 text-center fill-height" style="border-radius:12px;">
                <v-icon size="40" color="primary" class="mb-2">mdi-heart-outline</v-icon>
                <h3 class="text-subtitle-1 font-weight-bold primary--text mb-2">Un mismo sentir</h3>
                <p class="text-body-2 grey--text text--darken-3 mb-3">
                  Pablo no pide solo palabras iguales, sino afecto común: "sintiendo lo mismo, teniendo el
                  mismo amor, unánimes, sintiendo una misma cosa". La alabanza sincera alinea el corazón
                  del pueblo hacia un mismo objeto de adoración, trascendiendo divisiones personales.
                </p>
                <v-card outlined class="pa-3 grey lighten-5 text-left">
                  <div class="d-flex align-center mb-1">
                    <v-icon color="primary" small class="mr-2">mdi-book-open-variant</v-icon>
                    <span class="text-caption font-weight-bold grey--text text--darken-4">Filipenses 2:2</span>
                  </div>
                  <p class="text-body-2 italic grey--text text--darken-3 mb-0">
                    "Completad mi gozo, sintiendo lo mismo, teniendo el mismo amor, unánimes, sintiendo
                    una misma cosa."
                  </p>
                </v-card>
              </v-card>
            </v-col>
          </v-row>

          <v-card class="pa-5" elevation="2"
            style="border-radius: 16px; border-left: 5px solid #1976D2;">
            <div class="d-flex align-start">
              <v-icon size="40" color="primary" class="mr-4 mt-1 flex-shrink-0">mdi-account-multiple-check</v-icon>
              <div>
                <h3 class="text-subtitle-1 font-weight-bold primary--text mb-2">
                  Cuando el pueblo canta, la iglesia se ve como es en su mejor momento
                </h3>
                <p class="text-body-2 grey--text text--darken-3 mb-3">
                  En la predicación escuchamos; en la oración participamos; en el servicio colaboramos.
                  Pero en la alabanza <strong>hacemos las tres cosas a la vez y en comunión</strong>:
                  escuchamos la Palabra hecha canto, elevamos juntos la oración y servimos con nuestra voz
                  e instrumento al edificio del cuerpo. Por eso, los textos sobre adoración congregacional
                  son también textos sobre unidad.
                </p>
                <v-divider class="mb-3" />
                <p class="text-body-2 grey--text text--darken-3 mb-0">
                  Efesios 5:19 y Colosenses 3:16 no separan "enseñar" de "cantar": la alabanza enseña,
                  consuela y une. Cuando cantas el mismo himno que tu hermano —aunque no compartáis gusto
                  musical, clase social ni criterio político— estás practicando la unidad que Pablo
                  exhortaba a guardar "en el vínculo de la paz" (Efesios 4:3).
                </p>
              </div>
            </div>
          </v-card>
        </courses-section>

        <!-- SECCIÓN 3: Pentecostés: La Unanimidad que Precedió al Espíritu -->
        <courses-section outlined title="Pentecostés: La Unanimidad que Precedió al Espíritu" icon="mdi-fire" text-class="">
          <p class="text-body-1 grey--text text--darken-3 mb-4">
            Antes de que el Espíritu Santo descendiera en Pentecostés, la Escritura registra algo que
            suele pasarse por alto: <strong>todos estaban unánimes en un mismo lugar</strong>. La
            unanimidad no fue la consecuencia del avivamiento, fue la condición previa. El derramamiento
            del Espíritu cayó sobre un pueblo que ya había decidido estar junto, esperar junto y adorar junto.
          </p>

          <v-card outlined class="pa-4 mb-4 orange lighten-5">
            <div class="d-flex align-center mb-3">
              <v-icon color="orange darken-3" class="mr-2">mdi-book-open-variant</v-icon>
              <span class="font-weight-bold orange--text text--darken-3">Hechos 2:1-4</span>
            </div>
            <p class="text-body-2 italic grey--text text--darken-3 mb-2">
              "Cuando llegó el día de Pentecostés, estaban todos <strong>unánimes juntos</strong>.
              Y de repente vino del cielo un estruendo como de un viento recio que soplaba, el cual
              llenó toda la casa donde estaban sentados… y fueron todos llenos del Espíritu Santo."
            </p>
            <div class="text-caption orange--text text--darken-3 font-weight-bold text-right">RVR1960</div>
          </v-card>

          <v-row dense class="mb-4">
            <v-col cols="12" md="4">
              <v-card outlined class="pa-4 text-center fill-height" style="border-radius:12px;">
                <v-icon size="40" color="deep-orange" class="mb-2">mdi-account-group</v-icon>
                <h3 class="text-subtitle-1 font-weight-bold deep-orange--text mb-2">Estaban todos</h3>
                <p class="text-body-2 grey--text text--darken-3 mb-0">
                  No unos pocos ni los más espirituales. La promesa del Padre era para todos, y todos
                  estuvieron presentes. La unanimidad requiere que nadie se excuse, nadie se aparte,
                  nadie llegue tarde al lugar de la espera.
                </p>
              </v-card>
            </v-col>

            <v-col cols="12" md="4">
              <v-card outlined class="pa-4 text-center fill-height" style="border-radius:12px;">
                <v-icon size="40" color="deep-orange" class="mb-2">mdi-handshake-outline</v-icon>
                <h3 class="text-subtitle-1 font-weight-bold deep-orange--text mb-2">Unánimes</h3>
                <p class="text-body-2 grey--text text--darken-3 mb-0">
                  La palabra griega <em>homothumadón</em> —"de un mismo ánimo"— aparece diez veces en
                  Hechos. Implica no solo estar en el mismo sitio, sino querer lo mismo, esperar lo
                  mismo, apuntar hacia el mismo Señor con el corazón alineado.
                </p>
              </v-card>
            </v-col>

            <v-col cols="12" md="4">
              <v-card outlined class="pa-4 text-center fill-height" style="border-radius:12px;">
                <v-icon size="40" color="deep-orange" class="mb-2">mdi-map-marker-outline</v-icon>
                <h3 class="text-subtitle-1 font-weight-bold deep-orange--text mb-2">En un mismo lugar</h3>
                <p class="text-body-2 grey--text text--darken-3 mb-0">
                  La presencia física compartida importa. Estaban en el mismo aposento alto, bajo el mismo
                  techo, respirando el mismo aire. El Espíritu vino sobre una comunidad que había elegido
                  congregarse, no dispersarse.
                </p>
              </v-card>
            </v-col>
          </v-row>

          <v-card class="pa-5 mb-4" elevation="2"
            style="border-radius: 16px; border-left: 5px solid #E64A19;">
            <div class="d-flex align-start">
              <v-icon size="40" color="deep-orange" class="mr-4 mt-1 flex-shrink-0">mdi-lightbulb-on-outline</v-icon>
              <div>
                <h3 class="text-subtitle-1 font-weight-bold deep-orange--text mb-2">
                  La unanimidad como clima espiritual
                </h3>
                <p class="text-body-2 grey--text text--darken-3 mb-3">
                  Hechos 1:14 ya anticipa esta unanimidad: los discípulos "perseveraban unánimes en oración
                  y ruego" durante los diez días de espera. No fue una reunión improvisada; fue una comunidad
                  que mantuvo el fuego del acuerdo encendido hasta que el Espíritu lo convirtió en llamas
                  sobre cada cabeza.
                </p>
                <v-divider class="mb-3" />
                <p class="text-body-2 grey--text text--darken-3 mb-0">
                  Cuando una congregación adora con esa misma unanimidad —dejando diferencias, preferencias
                  y agendas personales a un lado para buscar juntos a Dios— se crea el mismo clima espiritual
                  que precedió al Pentecostés. La alabanza congregacional unánime no es un ritual: es una
                  invitación al Espíritu.
                </p>
              </div>
            </div>
          </v-card>

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
