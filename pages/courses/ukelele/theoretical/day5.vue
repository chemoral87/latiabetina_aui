<template>
  <div>
    <courses-header v-model="showContent" title="Teórico - Día 5" />

    <v-expand-transition>
      <div v-if="showContent" class="pa-4">

        <!-- SECCION 1: ¿Qué es la Cejilla? -->
        <courses-section title="¿Qué es la Cejilla (Barré)?" icon="mdi-hand-back-right-outline">
          <p class="text-body-2 grey--text text--darken-3 mb-4">
            La <strong>cejilla</strong> (o <em>barré</em>, del francés "barra") es una técnica en la que
            un solo dedo de la mano izquierda —normalmente el índice— presiona <strong>varias o todas
            las cuerdas</strong> al mismo tiempo sobre un mismo traste, actuando como si fuera una
            "cejuela móvil".
          </p>

          <p class="text-body-2 grey--text text--darken-3 mb-0">
            Esto libera a los demás dedos (medio, anular y meñique) para formar el resto del acorde
            sobre esa base, lo que permite tocar acordes que de otra forma serían imposibles con
            posiciones abiertas.
          </p>
        </courses-section>

        <!-- SECCION 2: ¿Por qué se usa? Acordes Movibles -->
        <courses-section title="Acordes Movibles: La Gran Ventaja de la Cejilla" icon="mdi-arrow-right-bold-box-outline">
          <p class="text-body-2 grey--text text--darken-3 mb-4">
            La principal ventaja de la cejilla es que convierte una digitación en una <strong>forma
            movible</strong>: si tomas la forma de un acorde con cejilla y la desplazas un traste hacia
            la derecha, el acorde sube exactamente <strong>un semitono</strong>. Esto significa que con
            una sola forma puedes tocar los 12 acordes mayores (o menores) de la escala cromática.
          </p>

          <v-simple-table dense class="mb-2">
            <thead>
              <tr>
                <th class="text-left">Traste de la Cejilla</th>
                <th class="text-left">Acorde resultante (forma de C)</th>
                <th class="text-left">Semitonos desde C</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="step in movable_shape_example" :key="step.fret">
                <td>
                  <v-chip x-small color="deep-purple" dark class="font-weight-bold">Traste {{ step.fret }}</v-chip>
                </td>
                <td class="font-weight-bold">{{ step.chord }}</td>
                <td class="text-body-2">{{ step.semitones }}</td>
              </tr>
            </tbody>
          </v-simple-table>

          <v-alert type="info" dense text class="mt-4 mb-0">
            Por eso decimos que la cejilla "transporta" un acorde: la forma de los dedos no cambia, solo
            se desplaza a lo largo del diapasón.
          </v-alert>
        </courses-section>

        <!-- SECCION 3: Tipos de Cejilla -->
        <courses-section title="Tipos de Cejilla" icon="mdi-format-list-bulleted-type">
          <p class="text-body-2 grey--text text--darken-2 mb-4">
            En el ukelele existen principalmente dos tipos de cejilla, según cuántas cuerdas cubre el
            dedo índice:
          </p>

          <v-simple-table dense class="mb-2">
            <thead>
              <tr>
                <th class="text-left">Tipo</th>
                <th class="text-left">Cuerdas que cubre</th>
                <th class="text-left">Uso típico</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="type in barre_types" :key="type.name">
                <td class="font-weight-bold">{{ type.name }}</td>
                <td class="text-body-2">{{ type.strings }}</td>
                <td class="text-body-2">{{ type.use }}</td>
              </tr>
            </tbody>
          </v-simple-table>

          <v-alert type="warning" dense text class="mt-4 mb-0">
            <strong>Consejo:</strong> la cejilla requiere práctica y firmeza en el dedo índice. Es normal
            que al principio algunas cuerdas suenen apagadas; con repetición, la presión se vuelve
            uniforme en toda la cejilla.
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

      movable_shape_example: [
        { fret: 0, chord: "C (Do Mayor)", semitones: "0 (forma abierta de referencia)" },
        { fret: 1, chord: "C# / Db (Do# Mayor)", semitones: "+1 semitono" },
        { fret: 2, chord: "D (Re Mayor)", semitones: "+2 semitonos" },
        { fret: 4, chord: "E (Mi Mayor)", semitones: "+4 semitonos" },
        { fret: 7, chord: "G (Sol Mayor)", semitones: "+7 semitonos" },
      ],

      barre_types: [
        { name: "Cejilla Total", strings: "Las 4 cuerdas", use: "Acordes mayores y menores movibles, basados en formas como C, A o G." },
        { name: "Cejilla Parcial", strings: "2 o 3 cuerdas", use: "Acordes que solo necesitan cubrir algunas cuerdas, dejando otras al aire o con otro dedo." },
      ],
    }
  },

  methods: {
    toggleContent() {
      this.showContent = !this.showContent
    },
  },
}
</script>
