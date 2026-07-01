<template>
  <div>
    <courses-header v-model="showContent" title="Teológico - Día 6" />

    <v-expand-transition>
      <div v-if="showContent" class="pa-4">
        <!-- SECCIÓN 1: La Consagración — Separado para Sonar -->
        <courses-section outlined title="La Consagración — Separado para Sonar" icon="mdi-star-circle-outline" text-class="">
          <p class="text-body-1 grey--text text--darken-3 mb-4">
            Un instrumento consagrado es un instrumento apartado. En el Antiguo Testamento, los levitas
            y sus instrumentos estaban dedicados al servicio del culto: no improvisaban por cuenta propia,
            sino que servían en la función para la que habían sido apartados (1 Cr 15:16-22). Esa
            dedicación los definía. Lo mismo ocurre con el creyente: la consagración no es un nivel de
            espiritualidad para unos pocos elegidos; es la vocación de todo aquel que ha sido redimido
            por la sangre de Cristo.
          </p>

          <v-row dense>
            <v-col cols="12" md="6" class="d-flex">
              <v-card outlined class="pa-4 grey lighten-5 w-100 d-flex flex-column justify-space-between">
                <div>
                  <div class="d-flex align-center mb-2">
                    <v-icon color="primary" class="mr-2">mdi-book-open-variant</v-icon>
                    <span class="font-weight-bold grey--text text--darken-4">Romanos 12:1</span>
                  </div>
                  <p class="text-body-2 italic grey--text text--darken-3 mb-0">
                    "Así que, hermanos, os ruego por las misericordias de Dios, que presentéis vuestros
                    cuerpos en sacrificio vivo, santo, agradable a Dios, que es vuestro culto racional."
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
                    por Dios, para que anunciéis las virtudes de aquel que os llamó de las tinieblas a su
                    luz admirable."
                  </p>
                </div>
                <div class="text-caption primary--text font-weight-bold mt-2 text-right">RVR1960</div>
              </v-card>
            </v-col>
          </v-row>

          <v-alert type="info" border="left" colored-border elevation="1" class="mt-2 mb-0">
            <div class="text-body-2 font-weight-medium grey--text text--darken-4">
              "Sacrificio vivo" es una paradoja. Los sacrificios en el Antiguo Testamento eran muertos.
              Pablo introduce algo radicalmente nuevo: un sacrificio que respira, que camina, que elige
              cada día mantenerse sobre el altar. La consagración no es un evento pasado; es una postura
              presente y continua.
            </div>
          </v-alert>
        </courses-section>

        <!-- SECCIÓN 2: El Instrumento y el Músico -->
        <courses-section outlined title="El Instrumento y el Músico" icon="mdi-guitar-pick-outline" text-class="">
          <p class="text-body-1 grey--text text--darken-3 mb-4">
            Un ukelele sin músico es madera y nilón. Puede ser hermoso, puede estar bien construido y
            perfectamente afinado, pero si nadie lo toma en sus manos, permanece en silencio. La
            consagración es el acto por el cual el creyente se pone en las manos de Dios y le dice:
            "Soy tuyo. Tócame. Haz sonar en mí lo que tú quieras."
          </p>

          <v-row dense class="mb-4">
            <v-col cols="12" md="4">
              <v-card outlined class="pa-4 text-center fill-height" style="border-radius:12px;">
                <v-icon size="40" color="primary" class="mb-2">mdi-music-off</v-icon>
                <h3 class="text-subtitle-1 font-weight-bold primary--text mb-2">Sin consagración</h3>
                <p class="text-body-2 grey--text text--darken-3 mb-0">
                  El instrumento existe, tiene dones, tiene capacidades, pero los usa para su propia gloria
                  o placer. La melodía que produce, aunque a veces brillante, no llega al destino
                  para el que fue creado.
                </p>
              </v-card>
            </v-col>

            <v-col cols="12" md="4">
              <v-card outlined class="pa-4 text-center fill-height" style="border-radius:12px;">
                <v-icon size="40" color="amber darken-2" class="mb-2">mdi-hand-pointing-right</v-icon>
                <h3 class="text-subtitle-1 font-weight-bold amber--text text--darken-2 mb-2">El momento de entrega</h3>
                <p class="text-body-2 grey--text text--darken-3 mb-0">
                  La consagración ocurre cuando el creyente, consciente del precio que Dios pagó por él,
                  decide voluntariamente poner su vida, sus dones y su tiempo en las manos del Maestro.
                  No por obligación; por amor y gratitud.
                </p>
              </v-card>
            </v-col>

            <v-col cols="12" md="4">
              <v-card outlined class="pa-4 text-center fill-height" style="border-radius:12px;">
                <v-icon size="40" color="green darken-2" class="mb-2">mdi-music</v-icon>
                <h3 class="text-subtitle-1 font-weight-bold green--text text--darken-2 mb-2">Con consagración</h3>
                <p class="text-body-2 grey--text text--darken-3 mb-0">
                  El Espíritu Santo toma ese instrumento entregado y produce a través de él música que
                  ninguna habilidad técnica podría generar por sí sola. El don humano se convierte en
                  vehículo de lo divino.
                </p>
              </v-card>
            </v-col>
          </v-row>

          <v-card class="pa-5" elevation="2"
            style="border-radius: 16px; border-left: 5px solid #1976D2;">
            <div class="d-flex align-start">
              <v-icon size="40" color="primary" class="mr-4 mt-1 flex-shrink-0">mdi-account-music-outline</v-icon>
              <div>
                <h3 class="text-subtitle-1 font-weight-bold primary--text mb-2">
                  2 Timoteo 2:21 — El vaso para honra
                </h3>
                <p class="text-body-2 italic grey--text text--darken-3 mb-3">
                  "Si alguno se limpiare de estas cosas, será instrumento para honra, santificado, útil al
                  Señor, y dispuesto para toda buena obra." — RVR1960
                </p>
                <v-divider class="mb-3" />
                <p class="text-body-2 grey--text text--darken-3 mb-0">
                  La palabra griega aquí traducida como "instrumento" significa "vaso" o "utensilio", no
                  instrumento musical; pero la imagen encaja: lo consagrado es lo apartado para uso honorable.
                  "Limpiarse" implica un proceso continuo, no una acción puntual. La consagración es un
                  estilo de vida: cada día eliges apartarte de lo que contamina y orientarte hacia lo que
                  honra a Dios. Como el músico que cada día limpia su instrumento, lo mantiene afinado y
                  lo guarda bien, el creyente consagrado cuida su vida espiritual con disciplina y amor.
                </p>
              </div>
            </div>
          </v-card>
        </courses-section>

        <!-- SECCIÓN 3: Dimensiones de la Consagración -->
        <courses-section outlined title="Dimensiones de la Consagración" icon="mdi-layers-triple-outline" text-class="">
          <p class="text-body-1 grey--text text--darken-3 mb-4">
            La consagración no es solo un sentimiento devocional. Tiene dimensiones concretas que tocan
            todas las áreas de la vida del creyente. Así como afinar un ukelele requiere atender las
            cuatro cuerdas una por una, la consagración integral atiende cada dimensión de la persona.
          </p>

          <v-row dense class="align-center mb-4">
            <v-col cols="12">
              <v-row dense>
                <v-col v-for="dim in dimensions" :key="dim.label" cols="12" md="6">
                  <v-card outlined class="pa-4 mb-2 d-flex align-start fill-height" style="border-radius:10px;">
                    <v-icon :color="dim.color" size="36" class="mr-4 mt-1 flex-shrink-0">{{ dim.icon }}</v-icon>
                    <div>
                      <div class="text-subtitle-1 font-weight-bold grey--text text--darken-4 mb-1">
                        {{ dim.label }}
                      </div>
                      <p class="text-body-2 grey--text text--darken-3 mb-2">{{ dim.desc }}</p>
                      <v-card outlined class="pa-2 grey lighten-5">
                        <div class="d-flex align-center mb-1">
                          <v-icon color="primary" x-small class="mr-1">mdi-book-open-variant</v-icon>
                          <span class="text-caption font-weight-bold primary--text">{{ dim.verse }}</span>
                        </div>
                        <p class="text-caption italic grey--text text--darken-3 mb-0">{{ dim.verseText }}</p>
                      </v-card>
                    </div>
                  </v-card>
                </v-col>
              </v-row>
            </v-col>
          </v-row>

          <v-alert type="warning" border="left" colored-border elevation="1" class="my-0">
            <div class="text-body-2 font-weight-medium grey--text text--darken-4">
              <strong>Aplicación práctica:</strong> Antes de la próxima sesión de práctica con tu ukelele,
              toma un momento para consagrar ese tiempo a Dios. No solo como ritual, sino como un acto
              consciente de entrega: "Señor, este tiempo es tuyo. Este don es tuyo. Que lo que aprendo
              aquí sea para tu gloria y para edificar tu cuerpo." La consagración transforma la práctica
              musical en un acto de adoración, y la adoración en el fundamento de todo ministerio.
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
          desc: "Los hábitos físicos —el descanso, la alimentación, la disciplina— son parte de la adoración. El cuerpo que toca el ukelele para Dios debe ser cuidado como el templo que es.",
          verse: "1 Corintios 6:19-20",
          verseText: "\"¿O ignoráis que vuestro cuerpo es templo del Espíritu Santo... glorificad, pues, a Dios en vuestro cuerpo y en vuestro espíritu.\"",
        },
        {
          label: "Consagración de la mente",
          icon: "mdi-brain",
          color: "purple darken-2",
          desc: "La renovación del entendimiento (Ro 12:2) cambia la manera en que el creyente interpreta la realidad, toma decisiones y usa sus capacidades intelectuales para honrar a Dios.",
          verse: "Romanos 12:2",
          verseText: "\"...transformaos por medio de la renovación de vuestro entendimiento, para que comprobéis cuál sea la buena voluntad de Dios.\"",
        },
        {
          label: "Consagración del tiempo",
          icon: "mdi-clock-outline",
          color: "orange darken-2",
          desc: "Cada hora del día es un don de Dios. La consagración del tiempo implica ordenarlo con sabiduría: dar primacía a lo eterno sin abandonar las responsabilidades cotidianas.",
          verse: "Efesios 5:15-16",
          verseText: "\"Mirad, pues, con diligencia cómo andéis, no como necios sino como sabios, aprovechando bien el tiempo.\"",
        },
        {
          label: "Consagración de los dones",
          icon: "mdi-gift-outline",
          color: "green darken-2",
          desc: "El don musical —y cualquier otro don— no fue dado para la autoexaltación del que lo recibió, sino para la edificación del cuerpo de Cristo y la gloria de Dios.",
          verse: "1 Pedro 4:10",
          verseText: "\"Cada uno según el don que ha recibido, minístrelo a los otros, como buenos administradores de la multiforme gracia de Dios.\"",
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
</style>
