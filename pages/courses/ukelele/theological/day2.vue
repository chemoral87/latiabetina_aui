<template>
  <div>
    <courses-header v-model="showContent" title="Teológico - Día 2" />

    <v-expand-transition>
      <div v-if="showContent" class="pa-4">

        <!-- SECCIÓN 1: Dios Habita en la Alabanza -->
        <courses-section outlined title="Dios Habita en la Alabanza de Su Pueblo" icon="mdi-heart-multiple" text-class="">
          <p class="text-body-1 grey--text text--darken-3 mb-4">
            La Biblia nos enseña una verdad transformadora: <strong>Dios habita en medio de la alabanza de su pueblo</strong>. Cuando nos reunimos para adorarle, no simplemente ofrecemos canciones; creamos un espacio donde la presencia divina se manifiesta de manera especial y poderosa.
          </p>

          <v-row dense class="mb-4">
            <v-col cols="12" md="6" class="d-flex">
              <v-card outlined class="pa-4 grey lighten-5 w-100 d-flex flex-column justify-space-between">
                <div>
                  <div class="d-flex align-center mb-2">
                    <v-icon color="primary" class="mr-2">mdi-book-open-variant</v-icon>
                    <span class="font-weight-bold grey--text text--darken-4">Salmo 22:3</span>
                  </div>
                  <p class="text-body-2 italic grey--text text--darken-3 mb-0">
                    "Pero tú eres santo, tú que habitas entre las alabanzas de Israel."
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
                    <span class="font-weight-bold grey--text text--darken-4">Salmo 100:1-4</span>
                  </div>
                  <p class="text-body-2 italic grey--text text--darken-3 mb-0">
                    "Cantad alegres a Dios, habitantes de toda la tierra. Servid a Jehová con alegría; Venid ante su presencia con regocijo... Entrad por sus puertas con acción de gracias, Por sus atrios con alabanza."
                  </p>
                </div>
                <div class="text-caption primary--text font-weight-bold mt-2 text-right">RVR1960</div>
              </v-card>
            </v-col>
          </v-row>

          <p class="text-body-2 grey--text text--darken-3 mb-4">
            La alabanza es el ambiente donde Dios se deleita en manifestar su gloria. No es que Dios esté ausente en otros lugares, pero <strong>en la alabanza genuina, Él se hace presente de una manera particular y transformadora</strong>.
          </p>
        </courses-section>

        <!-- SECCIÓN 2: Omnipresencia vs Manifestación -->
        <courses-section outlined title="Dios Está en Todas Partes, Pero No Se Manifiesta en Todas Partes" icon="mdi-eye-outline" text-class="">
          <p class="text-body-1 grey--text text--darken-3 mb-4">
            Es importante comprender una verdad teológica fundamental: <strong>la omnipresencia de Dios no es lo mismo que la manifestación de su poder y gloria</strong>. Dios existe en todas partes, pero Él elige manifestar su presencia de manera especial en ciertos lugares y momentos.
          </p>

          <v-card outlined class="pa-4 mb-4 blue lighten-5">
            <p class="text-subtitle-2 font-weight-bold blue--text text--darken-3 mb-3">
              <v-icon color="blue darken-3" class="mr-2">mdi-lightbulb-on</v-icon>
              La Diferencia Clave
            </p>
            <v-row dense>
              <v-col cols="12" md="6">
                <div class="pa-3 rounded" style="background-color: rgba(63, 81, 181, 0.1);">
                  <p class="text-subtitle-2 font-weight-bold blue--text text--darken-3 mb-2">Omnipresencia</p>
                  <p class="text-body-2 grey--text text--darken-3">
                    Dios está en todo lugar, en todo momento. Él nunca está ausente. Su conocimiento y su poder alcanzan todos los rincones del universo.
                  </p>
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <div class="pa-3 rounded" style="background-color: rgba(244, 67, 54, 0.1);">
                  <p class="text-subtitle-2 font-weight-bold red--text text--darken-3 mb-2">Manifestación</p>
                  <p class="text-body-2 grey--text text--darken-3">
                    La presencia manifiesta es cuando Dios decide revelarse, actuar y transformar una situación de manera visible y poderosa. Esta ocurre especialmente en la adoración sincera.
                  </p>
                </div>
              </v-col>
            </v-row>
          </v-card>

          <v-row dense class="mb-4">
            <v-col cols="12" md="6" class="d-flex">
              <v-card outlined class="pa-4 grey lighten-5 w-100 d-flex flex-column justify-space-between">
                <div>
                  <div class="d-flex align-center mb-2">
                    <v-icon color="primary" class="mr-2">mdi-book-open-variant</v-icon>
                    <span class="font-weight-bold grey--text text--darken-4">Salmo 139:7-8 (Omnipresencia)</span>
                  </div>
                  <p class="text-body-2 italic grey--text text--darken-3 mb-0">
                    "¿A dónde me iré de tu Espíritu? ¿Y a dónde huiré de tu presencia? Si subiere a los cielos, allí estás tú; y si en el Seol hiciere mi estrado, he aquí, allí tú estás."
                  </p>
                  <p class="text-caption grey--text text--darken-2 mt-2 mb-0">
                    <strong>Definición teológica:</strong> Dios está presente en todo lugar del universo de manera ilimitada y constante, independientemente de la conciencia o reconocimiento del hombre.
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
                    <span class="font-weight-bold grey--text text--darken-4">Éxodo 33:14-15 (Manifestación)</span>
                  </div>
                  <p class="text-body-2 italic grey--text text--darken-3 mb-0">
                    "Y él dijo: Mi presencia irá contigo, y te daré descanso. Y Moisés respondió: Si tu presencia no ha de ir conmigo, no nos saques de aquí."
                  </p>
                  <p class="text-caption grey--text text--darken-2 mt-2 mb-0">
                    <strong>Ejemplos de su manifestación:</strong> La nube en el desierto (cobertura), la columna de fuego (dirección nocturna) y el maná del cielo (sustento diario).
                  </p>
                </div>
                <div class="text-caption primary--text font-weight-bold mt-2 text-right">RVR1960</div>
              </v-card>
            </v-col>
          </v-row>
        </courses-section>

        <!-- SECCIÓN 3: Ataque Espiritual vs Adoración -->
        <courses-section outlined title="El Poder de la Adoración: 1 Hora Reprendiendo al enemigo vs 1 Hora Adorando a Dios" icon="mdi-shield-account" text-class="">
          <p class="text-body-1 grey--text text--darken-3 mb-4">
            La diferencia entre desgastarnos luchando solos y traer la presencia de Dios al campo de batalla es abismal. La Biblia nos enseña que la verdadera guerra espiritual comienza con la sumisión a Dios y se manifiesta en la alabanza:
          </p>

          <v-row dense class="mb-4">
            <v-col cols="12" md="6" class="d-flex">
              <v-card outlined class="pa-4 grey lighten-5 w-100 d-flex flex-column justify-space-between">
                <div>
                  <div class="d-flex align-center mb-2">
                    <v-icon color="primary" class="mr-2">mdi-book-open-variant</v-icon>
                    <span class="font-weight-bold grey--text text--darken-4">Santiago 4:7</span>
                  </div>
                  <p class="text-caption grey--text text--darken-2 mb-2">
                    <strong>Contexto:</strong> Santiago enseña que la victoria sobre el mal no proviene de una confrontación directa basada en nuestras fuerzas, sino de un orden espiritual: primero la sumisión a Dios (adoración) y luego la resistencia.
                  </p>
                  <p class="text-body-2 italic grey--text text--darken-3 mb-0">
                    "Someteos, pues, a Dios; resistid al diablo, y huirá de vosotros."
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
                    <span class="font-weight-bold grey--text text--darken-4">2 Crónicas 20:21-22</span>
                  </div>
                  <p class="text-caption grey--text text--darken-2 mb-2">
                    <strong>Contexto:</strong> Ante un ejército masivo que los superaba, el rey Josafat colocó a los cantores en la vanguardia de sus tropas. Al comenzar la alabanza, Dios derrotó a los enemigos sin que Judá tuviera que pelear.
                  </p>
                  <p class="text-body-2 italic grey--text text--darken-3 mb-0">
                    "Y habiendo aconsejado con el pueblo, puso a algunos que cantasen y alabasen a Jehová... Y cuando comenzaron a entonar cantos de alabanza, Jehová puso contra los enemigos emboscadas..."
                  </p>
                </div>
                <div class="text-caption primary--text font-weight-bold mt-2 text-right">RVR1960</div>
              </v-card>
            </v-col>
          </v-row>

          <p class="text-body-2 grey--text text--darken-3 mb-4">
            Consideremos este contraste práctico entre desgastarnos batallando directamente y rendirnos a la adoración:
          </p>

          <v-row dense class="mb-4">
            <!-- Ataque Espiritual / Lucha -->
            <v-col cols="12" md="6">
              <v-card outlined class="pa-4 h-100" style="border-color: #d32f2f; background-color: rgba(211, 47, 47, 0.05);">
                <div class="d-flex align-center mb-3">
                  <v-icon color="red darken-2" class="mr-2" large>mdi-cloud-alert</v-icon>
                  <h3 class="text-subtitle-1 font-weight-bold red--text text--darken-2">1 Hora Reprendiendo al enemigo</h3>
                </div>

                <div class="pa-3 rounded mb-3" style="background-color: rgba(211, 47, 47, 0.1);">
                  <ul class="text-body-2 grey--text text--darken-3 pl-4">
                    <li class="mb-2"><strong>Desgaste innecesario</strong> al pelear la batalla en tus propias fuerzas</li>
                    <li class="mb-2"><strong>Cansancio espiritual</strong> por centrar toda la atención en el enemigo</li>
                    <li class="mb-2"><strong>Tensión y ansiedad</strong> al enfocarte en la confrontación directa</li>
                    <li class="mb-2"><strong>Duda y frustración</strong> si no ves resultados inmediatos</li>
                    <li class="mb-2"><strong>Lucha solitaria</strong> que te agota mental y emocionalmente</li>
                    <li><strong>Enfoque equivocado</strong> al mirar el problema en lugar del Vencedor</li>
                  </ul>
                </div>

                <p class="text-caption red--text text--darken-1 font-weight-bold mb-0">
                  Resultado: Agotamiento y desgaste por pelear una lucha con tus propios recursos y fuerzas.
                </p>
              </v-card>
            </v-col>

            <!-- Adoración / Presencia -->
            <v-col cols="12" md="6">
              <v-card outlined class="pa-4 h-100" style="border-color: #388e3c; background-color: rgba(56, 142, 60, 0.05);">
                <div class="d-flex align-center mb-3">
                  <v-icon color="green darken-2" class="mr-2" large>mdi-music-box-multiple</v-icon>
                  <h3 class="text-subtitle-1 font-weight-bold green--text text--darken-2">1 Hora Adorando a Dios</h3>
                </div>

                <div class="pa-3 rounded mb-3" style="background-color: rgba(56, 142, 60, 0.1);">
                  <ul class="text-body-2 grey--text text--darken-3 pl-4">
                    <li class="mb-2"><strong>Presencia manifiesta</strong> que entra directamente al campo de batalla</li>
                    <li class="mb-2"><strong>Descanso espiritual</strong> porque entiendes que la batalla es del Señor</li>
                    <li class="mb-2"><strong>Paz y seguridad</strong> que sobrepasan todo entendimiento humano</li>
                    <li class="mb-2"><strong>Fe fortalecida</strong> al contemplar la grandeza del Dios viviente</li>
                    <li class="mb-2"><strong>Atmósfera de victoria</strong> donde el enemigo no puede permanecer</li>
                    <li><strong>Restauración divina</strong> que renueva tus fuerzas físicas y espirituales</li>
                  </ul>
                </div>

                <p class="text-caption green--text text--darken-1 font-weight-bold mb-0">
                  Resultado: La presencia manifiesta del Altísimo tomando el control y peleando la batalla por ti.
                </p>
              </v-card>
            </v-col>
          </v-row>

          <v-alert type="warning" outlined class="mb-4">
            <strong>Enseñanza clave:</strong> En lugar de desgastarnos en una lucha solos tratando de reprender al enemigo con nuestras propias fuerzas, es infinitamente mejor traer la presencia de Dios al campo de batalla a través de la adoración. Cuando adoras, Dios pelea por ti.
          </v-alert>
        </courses-section>

        <!-- SECCIÓN 4: La Adoración Echa Fuera el Temor -->
        <courses-section outlined title="La Adoración Echa Fuera Todo Temor" icon="mdi-heart-plus" text-class="">
          <p class="text-body-1 grey--text text--darken-3 mb-4">
            Uno de los poderes más transformadores de la adoración genuina es su capacidad de aniquilar el temor. <strong>No existe temor que pueda sobrevivir en la presencia de una adoración sincera y apasionada</strong>.
          </p>

          <v-row dense class="mb-4">
            <v-col cols="12" md="6" class="d-flex">
              <v-card outlined class="pa-4 grey lighten-5 w-100 d-flex flex-column justify-space-between">
                <div>
                  <div class="d-flex align-center mb-2">
                    <v-icon color="primary" class="mr-2">mdi-book-open-variant</v-icon>
                    <span class="font-weight-bold grey--text text--darken-4">Salmo 27:1, 4</span>
                  </div>
                  <p class="text-body-2 italic grey--text text--darken-3 mb-0">
                    "Jehová es mi luz y mi salvación; ¿de quién temeré?... Una cosa he demandado a Jehová, esta buscaré; Que esté yo en la casa de Jehová todos los días de mi vida, para contemplar la hermosura de Jehová, y para buscarle en su templo."
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
                    <span class="font-weight-bold grey--text text--darken-4">Filipenses 4:6-7</span>
                  </div>
                  <p class="text-body-2 italic grey--text text--darken-3 mb-0">
                    "Por nada estéis afanosos, sino sean conocidas vuestras peticiones delante de Dios en toda oración y ruego, con acción de gracias. Y la paz de Dios, que sobrepasa todo entendimiento, guardará vuestros corazones y vuestros pensamientos en Cristo Jesús."
                  </p>
                </div>
                <div class="text-caption primary--text font-weight-bold mt-2 text-right">RVR1960</div>
              </v-card>
            </v-col>
          </v-row>

          <v-card outlined class="pa-4 purple lighten-5">
            <p class="text-subtitle-2 font-weight-bold purple--text text--darken-3 mb-3">
              <v-icon color="purple darken-3" class="mr-2">mdi-check-circle</v-icon>
              Cómo la Adoración Combate el Temor
            </p>
            <ol class="text-body-2 grey--text text--darken-3 pl-4">
              <li class="mb-2"><strong>Reenfoca tu atención:</strong> En lugar de mirar tus circunstancias aterradoras, levantas tus ojos al Dios invencible.</li>
              <li class="mb-2"><strong>Activa la fe:</strong> Cuando cantas la grandeza de Dios, tu fe crece y el temor disminuye.</li>
              <li class="mb-2"><strong>Invoca la presencia divina:</strong> La adoración sincera trae la presencia manifiesta de Dios, que expulsa toda oscuridad.</li>
              <li class="mb-2"><strong>Cambia tu atmósfera espiritual:</strong> El ambiente que rodea tu vida pasa de opresión a libertad.</li>
              <li><strong>Restaura la paz:</strong> La paz de Dios, que sobrepasa todo entendimiento, reemplaza la ansiedad y el miedo.</li>
            </ol>
          </v-card>

          <v-alert type="success" dense text class="mt-4">
            <strong>Conclusión:</strong> Si en este momento estás bajo ataque espiritual, si el temor te abruma, la solución no es luchar con tus propias fuerzas. 
            <strong>Abre tu corazón a la adoración.</strong> Canta, alaba, adora genuinamente al Dios que habita entre tus alabanzas. 
            La manifestación de su presencia será más poderosa que cualquier ataque.
          </v-alert>
        </courses-section>

      </div>
    </v-expand-transition>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showContent: true,
    }
  },
}
</script>