<template>
  <div>
    <courses-header v-model="showContent" title="Teológico - Día 4" />

    <v-expand-transition>
      <div v-if="showContent" class="pa-4">
        <!-- SECCIÓN 1: La Unidad — Más que Uniformidad -->
        <courses-section outlined title="La Unidad — Más que Uniformidad" icon="mdi-account-group-outline" text-class="">
          <p class="text-body-1 grey--text text--darken-3 mb-4">
            El ukelele tiene cuatro cuerdas. Cada una está afinada en una nota diferente: Sol, Do, Mi y La.
            No suenan igual, no vibran igual, no ocupan el mismo espacio en el diapasón. Y sin embargo,
            juntas forman la base de todos los acordes. La unidad del cuerpo de Cristo funciona de la misma
            manera: no es uniformidad de personalidades, sino unidad de propósito, corazón y espíritu.
          </p>

          <v-row dense>
            <v-col cols="12" md="6" class="d-flex">
              <v-card outlined class="pa-4 grey lighten-5 w-100 d-flex flex-column justify-space-between">
                <div>
                  <div class="d-flex align-center mb-2">
                    <v-icon color="primary" class="mr-2">mdi-book-open-variant</v-icon>
                    <span class="font-weight-bold grey--text text--darken-4">Filipenses 2:2</span>
                  </div>
                  <p class="text-body-2 italic grey--text text--darken-3 mb-0">
                    "Completad mi gozo, sintiendo lo mismo, teniendo el mismo amor, unánimes, sintiendo
                    una misma cosa."
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
                    <span class="font-weight-bold grey--text text--darken-4">Efesios 4:4-6</span>
                  </div>
                  <p class="text-body-2 italic grey--text text--darken-3 mb-0">
                    "Un cuerpo, y un Espíritu, como fuisteis también llamados en una misma esperanza de
                    vuestra vocación; un Señor, una fe, un bautismo, un Dios y Padre de todos."
                  </p>
                </div>
                <div class="text-caption primary--text font-weight-bold mt-2 text-right">RVR1960</div>
              </v-card>
            </v-col>
          </v-row>

          <v-alert type="info" border="left" colored-border elevation="1" class="mt-2 mb-0">
            <div class="text-body-2 font-weight-medium grey--text text--darken-4">
              La unidad bíblica no borra las diferencias entre los creyentes; las redime y las pone al
              servicio de un mismo Señor. Como las cuatro cuerdas del ukelele, cada miembro del cuerpo de
              Cristo suena en su propia frecuencia, pero todos están acordados a la misma fuente: el
              Espíritu Santo.
            </div>
          </v-alert>
        </courses-section>

        <!-- SECCIÓN 2: Los Fundamentos de la Unidad -->
        <courses-section outlined title="Los Fundamentos de la Unidad" icon="mdi-pillar" text-class="">
          <p class="text-body-1 grey--text text--darken-3 mb-4">
            Así como un ukelele necesita estar correctamente construido —clavijero, mástil, caja de
            resonancia y cuerdas— la unidad eclesial descansa sobre fundamentos que no pueden ignorarse.
            Sin ellos, la comunidad se convierte en una simple reunión social, no en el cuerpo vivo de
            Cristo.
          </p>

          <v-row dense class="mb-4">
            <v-col cols="12" md="3">
              <v-card outlined class="pa-4 text-center fill-height" style="border-radius:12px;">
                <v-icon size="40" color="primary" class="mb-2">mdi-cross</v-icon>
                <h3 class="text-subtitle-1 font-weight-bold primary--text mb-2">Un mismo Señor</h3>
                <p class="text-body-2 grey--text text--darken-3 mb-0">
                  La unidad cristiana tiene un centro: Jesucristo. Sin Él como cabeza, cualquier
                  unidad es superficial y frágil.
                </p>
              </v-card>
            </v-col>

            <v-col cols="12" md="3">
              <v-card outlined class="pa-4 text-center fill-height" style="border-radius:12px;">
                <v-icon size="40" color="primary" class="mb-2">mdi-fire</v-icon>
                <h3 class="text-subtitle-1 font-weight-bold primary--text mb-2">Un mismo Espíritu</h3>
                <p class="text-body-2 grey--text text--darken-3 mb-0">
                  Es el Espíritu Santo quien afina los corazones, distribuye los dones y mantiene la paz
                  que sobrepasa todo entendimiento dentro del cuerpo.
                </p>
              </v-card>
            </v-col>

            <v-col cols="12" md="3">
              <v-card outlined class="pa-4 text-center fill-height" style="border-radius:12px;">
                <v-icon size="40" color="primary" class="mb-2">mdi-heart-multiple-outline</v-icon>
                <h3 class="text-subtitle-1 font-weight-bold primary--text mb-2">Un mismo amor</h3>
                <p class="text-body-2 grey--text text--darken-3 mb-0">
                  El amor ágape no es sentimiento, es decisión. Es la "cuerda" que mantiene unidos a los
                  miembros cuando las diferencias amenazan con romper la comunión.
                </p>
              </v-card>
            </v-col>

            <v-col cols="12" md="3">
              <v-card outlined class="pa-4 text-center fill-height" style="border-radius:12px;">
                <v-icon size="40" color="primary" class="mb-2">mdi-target</v-icon>
                <h3 class="text-subtitle-1 font-weight-bold primary--text mb-2">Un mismo propósito</h3>
                <p class="text-body-2 grey--text text--darken-3 mb-0">
                  Glorificar a Dios y extender su reino. Cuando cada miembro recuerda para qué existe la
                  Iglesia, las disputas secundarias pierden su poder de dividir.
                </p>
              </v-card>
            </v-col>
          </v-row>

          <v-card class="pa-5" elevation="2"
            style="border-radius: 16px; border-left: 5px solid #1976D2;">
            <div class="d-flex align-start">
              <v-icon size="40" color="primary" class="mr-4 mt-1 flex-shrink-0">mdi-tune-vertical</v-icon>
              <div>
                <h3 class="text-subtitle-1 font-weight-bold primary--text mb-2">
                  La afinación como disciplina espiritual
                </h3>
                <p class="text-body-2 grey--text text--darken-3 mb-3">
                  Antes de tocar, un músico afina. No una vez en su vida, sino cada vez que va a tocar.
                  La afinación es un acto continuo de humildad: reconoces que tu instrumento se desajusta
                  con el tiempo y el uso, y lo corriges con referencia a un estándar externo.
                </p>
                <v-divider class="mb-3" />
                <p class="text-body-2 grey--text text--darken-3 mb-0">
                  Del mismo modo, la unidad del cuerpo de Cristo requiere una "afinación" continua a
                  través de la Palabra, la oración, el perdón mutuo y la comunión. No basta con haber
                  estado unidos ayer; la unidad hay que cultivarla hoy.
                </p>
              </div>
            </div>
          </v-card>
        </courses-section>

        <!-- SECCIÓN 3: Enemigos de la Unidad -->
        <courses-section outlined title="Enemigos de la Unidad" icon="mdi-alert-circle-outline" text-class="">
          <p class="text-body-1 grey--text text--darken-3 mb-4">
            Pablo no romantizó la unidad. En sus cartas nombró con claridad las fuerzas que la destrozan.
            Conocerlas es el primer paso para resistirlas.
          </p>

          <v-row dense class="align-center mb-4">
            <v-col cols="12" md="8">
              <h3 class="text-subtitle-1 font-weight-bold primary--text mb-2">Lo que desafina el cuerpo</h3>
              <v-list dense>
                <v-list-item v-for="item in enemies" :key="item.text" class="px-0">
                  <v-list-item-icon class="mr-2">
                    <v-icon color="red darken-2" small>{{ item.icon }}</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title class="text-body-2 grey--text text--darken-3 text-wrap">
                      <strong>{{ item.label }}:</strong> {{ item.text }}
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-col>

            <v-col cols="12" md="4" class="text-center">
              <v-card outlined class="pa-4 fill-height d-flex flex-column justify-center align-center">
                <v-icon size="48" color="green darken-2" class="mb-2">mdi-shield-check-outline</v-icon>
                <div class="text-subtitle-2 font-weight-bold mb-1">El antídoto</div>
                <p class="text-caption grey--text text--darken-2 mb-0">
                  "Soportándoos los unos a los otros en amor, solícitos en guardar la unidad del
                  Espíritu en el vínculo de la paz." — Ef 4:2-3
                </p>
              </v-card>
            </v-col>
          </v-row>

          <v-alert type="warning" border="left" colored-border elevation="1" class="my-0">
            <div class="text-body-2 font-weight-medium grey--text text--darken-4">
              <strong>Aplicación práctica:</strong> Revisa hoy cuál "cuerda" de tu corazón está desafinada
              con respecto a algún hermano. La unidad no es solo responsabilidad del pastor ni del líder de
              alabanza; es responsabilidad de cada miembro del cuerpo. Afínate tú primero, y contribuye a
              la armonía del conjunto.
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
      enemies: [
        {
          icon: "mdi-emoticon-angry-outline",
          label: "Orgullo",
          text: "Colocar el propio don por encima del bien del cuerpo. Una cuerda que quiere sonar más fuerte que las demás no produce armonía, produce ruido.",
        },
        {
          icon: "mdi-forum-remove-outline",
          label: "Murmuración",
          text: "Hablar mal de un hermano a espaldas suyas introduce disonancia antes de que el problema se haya intentado resolver directamente.",
        },
        {
          icon: "mdi-account-cancel-outline",
          label: "Falta de perdón",
          text: "Un corazón que guarda resentimiento no puede tocar en el mismo conjunto que quien le ofendió. El perdón no es debilidad; es la afinación del alma.",
        },
        {
          icon: "mdi-flag-variant-outline",
          label: "Facciones y divisiones",
          text: "Separarse en grupos que compiten entre sí es equivalente a que las cuerdas del ukelele decidieran tocar melodías diferentes al mismo tiempo.",
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
.text-wrap {
  white-space: normal;
}
</style>
