<template>
  <div>
    <courses-header v-model="showContent" title="Teórico - Día 2" />

    <v-expand-transition>
      <div v-if="showContent" class="pa-4">

        <!-- SECCION 1: Escala Cromática -->
        <courses-section title="La Escala Cromática: Padre de Todas las Escalas" icon="mdi-music-note-half">
          <p class="text-subtitle-1 font-weight-medium mb-3">¿Qué es la escala cromática?</p>
          <p class="text-body-2 grey--text text--darken-2 mb-4">
            La <strong>escala cromática</strong> es la madre de todas las escalas musicales. Contiene
            <strong>12 semitonos</strong> consecutivos dentro de una octava. Cada semitono representa
            la distancia más pequeña posible entre dos notas en la música occidental moderna.
          </p>

          <p class="text-body-2 grey--text text--darken-2 mb-4">
            <strong>Importancia:</strong> Es la base sobre la cual se construyen todas las demás escalas.
            Cualquier escala musical (mayor, menor, pentatónica, etc.) es en realidad una <strong>selección
              específica de notas de la escala cromática</strong>.
          </p>

          <p class="text-subtitle-2 font-weight-medium mb-3">Las 12 notas de la escala cromática</p>
          <v-row dense class="mb-4">
            <v-col cols="12">
              <v-chip-group column>
                <v-chip v-for="note in chromaticScale" :key="note" :color="getColorForNote(note)" dark small label
                  class="font-weight-medium">
                  {{ note }}
                </v-chip>
              </v-chip-group>
            </v-col>
          </v-row>

          <v-card outlined class="pa-4 mt-4">
            <p class="text-subtitle-2 font-weight-medium mb-3">Tabla Comparativa de Escalas</p>
            <v-simple-table dense>
              <thead>
                <tr>
                  <th class="text-left font-weight-bold" style="width: 220px;">Escala</th>
                  <th v-for="(note, idx) in scaleNotesReference" :key="idx" class="text-center font-weight-bold px-1">
                    {{ note }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <!-- Escala Cromática Row -->
                <tr>
                  <td><strong>Escala Cromática</strong></td>
                  <td v-for="(note, idx) in scaleNotesReference" :key="idx" class="text-center px-1">
                    <v-chip x-small color="grey darken-1" dark class="ma-0 font-weight-medium"
                      style="min-width: 32px; justify-content: center;">
                      {{ note }}
                    </v-chip>
                  </td>
                </tr>
                <!-- Escala Mayor de Do Row -->
                <tr>
                  <td><strong>Escala Mayor de Do</strong></td>
                  <td v-for="(note, idx) in scaleNotesReference" :key="idx" class="text-center px-1">
                    <v-chip v-if="majorScaleC.includes(note) || note === 'Do'" x-small color="blue darken-1" dark
                      class="ma-0 font-weight-medium" style="min-width: 32px; justify-content: center;">
                      {{ note }}
                    </v-chip>
                    <span v-else class="grey--text text--lighten-2">-</span>
                  </td>
                </tr>
                <!-- Pentatónica Mayor de Do Row -->
                <tr>
                  <td><strong>Pentatónica Mayor de Do</strong></td>
                  <td v-for="(note, idx) in scaleNotesReference" :key="idx" class="text-center px-1">
                    <v-chip v-if="pentatonicScaleC.includes(note) || note === 'Do'" x-small color="purple darken-1" dark
                      class="ma-0 font-weight-medium" style="min-width: 32px; justify-content: center;">
                      {{ note }}
                    </v-chip>
                    <span v-else class="grey--text text--lighten-2">-</span>
                  </td>
                </tr>
              </tbody>
            </v-simple-table>
          </v-card>

          <v-alert type="info" dense text class="mt-4">
            <strong>Conclusión:</strong> Todas las escalas musicales son subconjuntos de la escala
            cromática. La escala cromática es el "universo" completo de posibilidades, y cada otra escala
            es una "selección específica" de ese universo.
          </v-alert>

        </courses-section>

        <!-- SECCION 2: Comparativa de Escalas Mayores -->
        <courses-section title="Escalas Mayores: Desde Do Hasta Fa" icon="mdi-piano">
          <p class="text-subtitle-1 font-weight-medium mb-3">¿Qué es una Escala Mayor?</p>
          <p class="text-body-2 grey--text text--darken-2 mb-4">
            La <strong>escala mayor</strong> es una de las escalas más importantes en la música. Contiene
            <strong>7 notas</strong> y sigue un patrón específico de tonos y semitonos (Tono-Tono-Semitono-Tono-Tono-Tono-Semitono).
            Cada nota que comienza puede generar una escala mayor distinta.
          </p>

          <v-card outlined class="pa-4 mt-4">
            <p class="text-subtitle-2 font-weight-medium mb-3">Comparativa de Escalas Mayores</p>
            <v-simple-table dense>
              <thead>
                <tr>
                  <th class="text-left font-weight-bold" style="width: 200px;">Escala</th>
                  <th v-for="(note, idx) in scaleNotesReference" :key="idx" class="text-center font-weight-bold px-1">
                    {{ note }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <!-- Escala Cromática -->
                <tr>
                  <td><strong>Escala Cromática</strong></td>
                  <td v-for="(note, idx) in scaleNotesReference" :key="idx" class="text-center px-1">
                    <v-chip x-small color="grey darken-1" dark class="ma-0 font-weight-medium"
                      style="min-width: 32px; justify-content: center;">
                      {{ note }}
                    </v-chip>
                  </td>
                </tr>
                <!-- Escala Mayor de Do -->
                <tr>
                  <td><strong>Mayor de Do</strong></td>
                  <td v-for="(note, idx) in scaleNotesReference" :key="idx" class="text-center px-1">
                    <v-chip v-if="majorScaleC.includes(note) || note === 'Do'" x-small color="blue" dark
                      class="ma-0 font-weight-medium" style="min-width: 32px; justify-content: center;">
                      {{ note }}
                    </v-chip>
                    <span v-else class="grey--text text--lighten-2">-</span>
                  </td>
                </tr>
                <!-- Escala Mayor de Do# -->
                <tr>
                  <td><strong>Mayor de Do#</strong></td>
                  <td v-for="(note, idx) in scaleNotesReference" :key="idx" class="text-center px-1">
                    <v-chip v-if="majorScaleCSharp.includes(note)" x-small color="cyan" dark
                      class="ma-0 font-weight-medium" style="min-width: 32px; justify-content: center;">
                      {{ note }}
                    </v-chip>
                    <span v-else class="grey--text text--lighten-2">-</span>
                  </td>
                </tr>
                <!-- Escala Mayor de Re -->
                <tr>
                  <td><strong>Mayor de Re</strong></td>
                  <td v-for="(note, idx) in scaleNotesReference" :key="idx" class="text-center px-1">
                    <v-chip v-if="majorScaleD.includes(note)" x-small color="teal" dark
                      class="ma-0 font-weight-medium" style="min-width: 32px; justify-content: center;">
                      {{ note }}
                    </v-chip>
                    <span v-else class="grey--text text--lighten-2">-</span>
                  </td>
                </tr>
                <!-- Escala Mayor de Re# -->
                <tr>
                  <td><strong>Mayor de Re#</strong></td>
                  <td v-for="(note, idx) in scaleNotesReference" :key="idx" class="text-center px-1">
                    <v-chip v-if="majorScaleDSharp.includes(note)" x-small color="green" dark
                      class="ma-0 font-weight-medium" style="min-width: 32px; justify-content: center;">
                      {{ note }}
                    </v-chip>
                    <span v-else class="grey--text text--lighten-2">-</span>
                  </td>
                </tr>
                <!-- Escala Mayor de Mi -->
                <tr>
                  <td><strong>Mayor de Mi</strong></td>
                  <td v-for="(note, idx) in scaleNotesReference" :key="idx" class="text-center px-1">
                    <v-chip v-if="majorScaleE.includes(note)" x-small color="lime" dark
                      class="ma-0 font-weight-medium" style="min-width: 32px; justify-content: center;">
                      {{ note }}
                    </v-chip>
                    <span v-else class="grey--text text--lighten-2">-</span>
                  </td>
                </tr>
                <!-- Escala Mayor de Fa -->
                <tr>
                  <td><strong>Mayor de Fa</strong></td>
                  <td v-for="(note, idx) in scaleNotesReference" :key="idx" class="text-center px-1">
                    <v-chip v-if="majorScaleF.includes(note)" x-small color="orange" dark
                      class="ma-0 font-weight-medium" style="min-width: 32px; justify-content: center;">
                      {{ note }}
                    </v-chip>
                    <span v-else class="grey--text text--lighten-2">-</span>
                  </td>
                </tr>
              </tbody>
            </v-simple-table>
          </v-card>

          <v-alert type="success" dense text class="mt-4">
            <strong>Patrón de la Escala Mayor:</strong> Cada escala mayor sigue el patrón de intervalos 
            <strong>T - T - S - T - T - T - S</strong> (Tono-Tono-Semitono-Tono-Tono-Tono-Semitono).
            Este patrón se mantiene igual sin importar la nota raíz, solo cambian las notas específicas.
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
      chromaticScale: [
        "Do", "Do#", "Re", "Re#", "Mi", "Fa",
        "Fa#", "Sol", "Sol#", "La", "La#", "Si"
      ],
      majorScaleC: ["Do", "Re", "Mi", "Fa", "Sol", "La", "Si"],
      pentatonicScaleC: ["Do", "Re", "Mi", "Sol", "La"],
      scaleNotesReference: ["Do", "Do#", "Re", "Re#", "Mi", "Fa", "Fa#", "Sol", "Sol#", "La", "La#", "Si", "Do"],      // Escalas Mayores para la sección comparativa
      majorScaleCSharp: ["Do#", "Re#", "Fa", "Fa#", "Sol#", "La#", "Do"],
      majorScaleD: ["Re", "Mi", "Fa#", "Sol", "La", "Si", "Do#"],
      majorScaleDSharp: ["Re#", "Fa", "Sol", "Sol#", "La#", "Do", "Re"],
      majorScaleE: ["Mi", "Fa#", "Sol#", "La", "Si", "Do#", "Re#"],
      majorScaleF: ["Fa", "Sol", "La", "La#", "Do", "Re", "Mi"],    }
  },

  methods: {
    getColorForNote(note) {
      // Agrupa notas por color para visualización
      const colors = {
        "Do": "green",
        "Re": "blue",
        "Mi": "purple",
        "Fa": "red",
        "Sol": "orange",
        "La": "pink",
        "Si": "indigo",
      };
      const baseNote = note.replace("#", "").replace("b", "");
      return colors[baseNote] || "grey";
    },
  },
}
</script>