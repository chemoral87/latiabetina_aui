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
            miembros diferentes que, unidos, producen una sola alabanza agradable a Dios. Al leer en
            contexto los salmos y relatos del culto israelita, la Escritura no presenta un solo canal
            —voz, instrumento o registro— como suficiente, sino que <strong>cada medio de alabanza
            tiene un lugar irremplazable</strong>: los instrumentos, las voces graves y las voces agudas
            convergen en una sola ofrenda.
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
              El Salmo 133 celebra la unidad fraterna —hermanos que habitan juntos—. La RVR1960 traduce
              "armonía", y esa imagen nos recuerda lo que ocurre cuando varias notas distintas —como el
              Do, el Mi y el Sol de un acorde mayor— suenan juntas sin chocar, sino complementándose. La
              unidad de la Iglesia funciona así: personas diferentes, dones diferentes, voces diferentes,
              unidas en un mismo propósito.
            </div>
          </v-alert>
        </courses-section>

        <!-- SECCIÓN 2: Todos son necesarios en la alabanza -->
        <courses-section outlined title="Todos son necesarios en la alabanza" icon="mdi-book-search-outline" text-class="">
          <p class="text-body-1 grey--text text--darken-3 mb-4">
            Para entender bien los textos sobre adoración conviene observar <strong>quién participa, con
            qué medios y en qué función</strong>. Leer Salmo 150, por ejemplo, no como un menú de
            opciones sino como el clímax deliberado del libro de los Salmos, muestra que Dios recibe con
            agrado una alabanza rica y variada: no porque un instrumento o una voz sea superior a otro,
            sino porque juntos reflejan la plenitud de un pueblo que lo exalta con todo lo que tiene.
          </p>

          <v-card outlined class="pa-4 mb-4 blue lighten-5">
            <p class="text-subtitle-2 font-weight-bold blue--text text--darken-3 mb-3">
              <v-icon color="blue darken-3" class="mr-2">mdi-lightbulb-on</v-icon>
              Tres claves para leer sobre adoración
            </p>
            <v-row dense>
              <v-col cols="12" md="4">
                <div class="pa-3 rounded fill-height" style="background-color: rgba(63, 81, 181, 0.1);">
                  <p class="text-subtitle-2 font-weight-bold blue--text text--darken-3 mb-2">El contexto literario</p>
                  <p class="text-body-2 grey--text text--darken-3 mb-0">
                    Salmo 150 cierra el libro repitiendo "Alabadle con…" siete veces. Esa repetición no
                    agota la lista: la amplía. El autor quiere que el lector entienda que la alabanza
                    legítima abarca <em>todos</em> los medios mencionados, no solo uno favorito.
                  </p>
                </div>
              </v-col>
              <v-col cols="12" md="4">
                <div class="pa-3 rounded fill-height" style="background-color: rgba(76, 175, 80, 0.1);">
                  <p class="text-subtitle-2 font-weight-bold green--text text--darken-3 mb-2">El contexto histórico</p>
                  <p class="text-body-2 grey--text text--darken-3 mb-0">
                    En 1 Crónicas 15:16-22 David asigna a levitas cantores <em>y</em> instrumentistas con
                    roles distintos. Nadie improvisaba solo: cada uno servía en su función para que el
                    conjunto sonara completo ante el arca de Dios.
                  </p>
                </div>
              </v-col>
              <v-col cols="12" md="4">
                <div class="pa-3 rounded fill-height" style="background-color: rgba(255, 152, 0, 0.1);">
                  <p class="text-subtitle-2 font-weight-bold orange--text text--darken-3 mb-2">La analogía del cuerpo</p>
                  <p class="text-body-2 grey--text text--darken-3 mb-0">
                    Pablo pregunta en 1 Corintios 12:17 si el oído puede decir que no necesita al ojo.
                    Aplicado a la alabanza: ningún registro vocal, ningún instrumento ni ningún don puede
                    declararse prescindible sin empobrecer al conjunto.
                  </p>
                </div>
              </v-col>
            </v-row>
          </v-card>

          <h3 class="text-subtitle-1 font-weight-bold primary--text mb-3">
            Tres voces de la alabanza: instrumentos, graves y agudas
          </h3>
          <p class="text-body-2 grey--text text--darken-3 mb-4">
            En la música, los registros graves aportan fundamento y peso —como la raíz de un acorde—,
            mientras las voces agudas llevan la melodía y la claridad hacia arriba. Los instrumentos
            tejen el paisaje sonoro entre ambos. La Biblia no usa la terminología moderna de "registro",
            pero sí describe un culto donde <strong>cuerdas, viento, percusión y canto humano conviven
            sin competir</strong>. Ninguno sustituye a los demás; cada uno completa lo que falta al otro.
          </p>

          <v-row dense class="mb-4">
            <v-col cols="12" md="4">
              <v-card outlined class="pa-4 fill-height" style="border-radius:12px;">
                <div class="d-flex align-center mb-3">
                  <v-icon size="36" color="primary" class="mr-2">mdi-guitar-acoustic</v-icon>
                  <h3 class="text-subtitle-1 font-weight-bold primary--text mb-0">Los instrumentos</h3>
                </div>
                <p class="text-body-2 grey--text text--darken-3 mb-3">
                  Salmo 150 no dice "alabadle solo con arpa", sino con bocina, salterio, pandero, cuerdas,
                  flautas y címbalos. Cada timbre añade una textura distinta. El ukelele que aprendes a
                  tocar encaja en esa tradición: no es adorno de fondo, sino voz propia dentro del coro
                  de la adoración.
                </p>
                <v-card outlined class="pa-3 grey lighten-5">
                  <div class="d-flex align-center mb-1">
                    <v-icon color="primary" small class="mr-2">mdi-book-open-variant</v-icon>
                    <span class="text-caption font-weight-bold grey--text text--darken-4">Salmo 150:3-5</span>
                  </div>
                  <p class="text-body-2 italic grey--text text--darken-3 mb-0">
                    "Alabadle a son de bocina… con salterio y arpa… con pandero y danza… con cuerdas y
                    flautas… con címbalos resonantes."
                  </p>
                </v-card>
              </v-card>
            </v-col>

            <v-col cols="12" md="4">
              <v-card outlined class="pa-4 fill-height" style="border-radius:12px;">
                <div class="d-flex align-center mb-3">
                  <v-icon size="36" color="primary" class="mr-2">mdi-account-voice</v-icon>
                  <h3 class="text-subtitle-1 font-weight-bold primary--text mb-0">Las voces graves</h3>
                </div>
                <p class="text-body-2 grey--text text--darken-3 mb-3">
                  Las voces graves —bajos y contraltos en el lenguaje coral— sostienen la armonía desde
                  abajo, como el bajo eléctrico o la cuerda más grave del ukelele. Sin ellas, la alabanza
                  pierde profundidad y firmeza. En el culto del templo, hombres y mujeres cantaban juntos;
                  Los registros más graves daban peso y estabilidad al canto común del pueblo.
                </p>
                <v-card outlined class="pa-3 grey lighten-5">
                  <div class="d-flex align-center mb-1">
                    <v-icon color="primary" small class="mr-2">mdi-book-open-variant</v-icon>
                    <span class="text-caption font-weight-bold grey--text text--darken-4">Salmo 96:1-2</span>
                  </div>
                  <p class="text-body-2 italic grey--text text--darken-3 mb-0">
                    "Cantad a Jehová cántico nuevo; cantad al Jehová, toda la tierra. Cantad a Jehová,
                    bendecid su nombre; Anunciad de día en día su salvación."
                  </p>
                </v-card>
              </v-card>
            </v-col>

            <v-col cols="12" md="4">
              <v-card outlined class="pa-4 fill-height" style="border-radius:12px;">
                <div class="d-flex align-center mb-3">
                  <v-icon size="36" color="primary" class="mr-2">mdi-account-music</v-icon>
                  <h3 class="text-subtitle-1 font-weight-bold primary--text mb-0">Las voces agudas</h3>
                </div>
                <p class="text-body-2 grey--text text--darken-3 mb-3">
                  Las voces agudas —sopranos y tenores altos— no "dominan" la alabanza por ser más
                  audibles; aportan luminosidad, júbilo y la línea melódica que el oído recuerda. Miriam
                  y las mujeres de Israel levantaron cantos de victoria con tamborines; su participación
                  no era secundaria, sino parte esencial del testimonio de liberación.
                </p>
                <v-card outlined class="pa-3 grey lighten-5">
                  <div class="d-flex align-center mb-1">
                    <v-icon color="primary" small class="mr-2">mdi-book-open-variant</v-icon>
                    <span class="text-caption font-weight-bold grey--text text--darken-4">Éxodo 15:20-21</span>
                  </div>
                  <p class="text-body-2 italic grey--text text--darken-3 mb-0">
                    "Entonces María la profetisa… tomó un pandero en su mano, y todas las mujeres
                    salieron en pos de ella con panderos y danzas. Y María respondía…"
                  </p>
                </v-card>
              </v-card>
            </v-col>
          </v-row>

          <v-alert type="success" border="left" colored-border elevation="1" class="mb-0">
            <div class="text-body-2 font-weight-medium grey--text text--darken-4">
              <strong>Para aplicar:</strong> Cuando un pasaje enumera medios de alabanza,
              pregúntate qué estaría incompleto si eliminaras uno. ¿Salmo 150 sin percusión? ¿Un coro sin
              graves? ¿Una congregación donde solo cantan los que tienen voz aguda? La Escritura construye
              una imagen de plenitud: <em>todos son importantes, todos son bienvenidos, todos suman</em>.
              No compiten por el centro; se distribuyen en el acorde común de la adoración.
            </div>
          </v-alert>
        </courses-section>

        <!-- SECCIÓN 3: La Analogía del Acorde -->
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
                  Do, Mi y Sol no son iguales entre sí; cada una vibra a su propia frecuencia —grave,
                  media y aguda. Pero precisamente por ser distintas y estar correctamente ordenadas, al
                  sonar juntas generan un acorde mayor: pleno, estable y agradable al oído.
                </p>
              </v-card>
            </v-col>

            <v-col cols="12" md="4">
              <v-card outlined class="pa-4 text-center fill-height" style="border-radius:12px;">
                <v-icon size="40" color="primary" class="mb-2">mdi-handshake-outline</v-icon>
                <h3 class="text-subtitle-1 font-weight-bold primary--text mb-2">Un cuerpo, muchos dones</h3>
                <p class="text-body-2 grey--text text--darken-3 mb-0">
                  En la iglesia, el que predica, el que sirve, el que canta con voz grave, el que canta
                  con voz aguda y el que toca un instrumento no compiten entre sí. Cada don —y cada
                  registro, y cada timbre— en su lugar correcto, suma a una sola alabanza que honra a Dios.
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
                  mal, aunque las demás estén perfectas. No hace falta que las cuatro cuerdas estén mal
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

        <!-- SECCIÓN 4: La Unidad como Testimonio -->
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
              cada cuerda —grave, media y aguda— debe estar afinada y sonar en su lugar, sin opacar a las
              demás. Si tu voz es grave, ancla la armonía; si es aguda, lleva el júbilo; si tocas un
              instrumento, aporta tu timbre único. Sirve con esa misma actitud: usa tu don sin competir,
              afina tu corazón en humildad, y suma tu parte a la armonía del cuerpo de Cristo.
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
