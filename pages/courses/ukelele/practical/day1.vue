<template>
  <div class="text-white bg-black min-h-screen">
    <h1
      class="d-inline-flex align-center"
      style="cursor: pointer"
      @click="toggleContent"
    >
      <v-icon color="black" class="mr-2">
        {{ showContent ? "mdi-menu-right" : "mdi-menu-down" }}
      </v-icon>
      Práctico - Día 1
    </h1>

    <v-expand-transition>
      <v-container v-if="showContent" class="pa-4" style="max-width: 860px">

        <!-- SECCION 1: Partes del ukelele y su afinacion -->
        <v-card class="mb-8" elevation="2">
          <v-card-title class="text-h6 font-weight-bold primary white--text py-3 px-4">
            <v-icon left color="white">mdi-guitar-acoustic</v-icon>
            Partes del Ukelele y su Afinacion
          </v-card-title>

          <v-card-text class="pt-4">
            <p class="text-subtitle-1 font-weight-medium mb-3">Partes principales</p>

            <v-row dense class="mb-4">
              <v-col v-for="part in ukelele_parts" :key="part.name" cols="12" sm="6" md="4">
                <v-card outlined class="pa-3 fill-height">
                  <div class="d-flex align-center mb-1">
                    <v-icon small color="primary" class="mr-2">{{ part.icon }}</v-icon>
                    <span class="font-weight-medium">{{ part.name }}</span>
                  </div>
                  <p class="text-body-2 grey--text text--darken-1 mb-0">{{ part.description }}</p>
                </v-card>
              </v-col>
            </v-row>

            <v-divider class="mb-4" />

            <p class="text-subtitle-1 font-weight-medium mb-2">Afinacion estandar (G-C-E-A)</p>
            <p class="text-body-2 grey--text text--darken-2 mb-3">
              El ukelele soprano, concert y tenor se afinan de forma reentrante: la cuerda 4 (G)
              suena mas aguda que las cuerdas 3 y 2.
            </p>

            <v-simple-table dense class="mb-3">
              <thead>
                <tr>
                  <th class="text-left">Cuerda</th>
                  <th class="text-left">Nota (ingles)</th>
                  <th class="text-left">Nota (latino)</th>
                  <th class="text-left">Posicion</th>
                  <th class="text-left">Referencia</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="string in tuning_strings" :key="string.number">
                  <td>
                    <v-chip x-small :color="string.color" dark>{{ string.number }}</v-chip>
                  </td>
                  <td><strong>{{ string.note_en }}</strong></td>
                  <td>{{ string.note_es }}</td>
                  <td class="text-body-2">{{ string.position }}</td>
                  <td class="text-body-2 grey--text">{{ string.hint }}</td>
                </tr>
              </tbody>
            </v-simple-table>

            <v-alert type="info" dense text class="mt-2">
              <strong>Tip:</strong> Para recordar el orden G-C-E-A usa la frase
              <em>"Good Cats Eat Avocados"</em>.
            </v-alert>
          </v-card-text>
        </v-card>

        <!-- SECCION 2: Notas musicales, sostenidos, bemoles y notacion -->
        <v-card elevation="2">
          <v-card-title class="text-h6 font-weight-bold secondary white--text py-3 px-4">
            <v-icon left color="white">mdi-music-note</v-icon>
            Notas Musicales, Sostenidos y Bemoles
          </v-card-title>

          <v-card-text class="pt-4">
            <p class="text-subtitle-1 font-weight-medium mb-2">Notacion latina vs. inglesa</p>
            <p class="text-body-2 grey--text text--darken-2 mb-3">
              En Latinoamerica se usa notacion <strong>latina (Do, Re, Mi...)</strong>.
              En el mundo anglosajon y en muchas apps se usa notacion <strong>inglesa (C, D, E...)</strong>.
              Ejemplo: Do = C.
            </p>

            <v-simple-table dense class="mb-5">
              <thead>
                <tr>
                  <th class="text-left">Latino</th>
                  <th class="text-left">Ingles</th>
                  <th class="text-left">Sostenido (#)</th>
                  <th class="text-left">Bemol (b) siguiente</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="note in notes_table" :key="note.latin">
                  <td><strong>{{ note.latin }}</strong></td>
                  <td>{{ note.english }}</td>
                  <td>
                    <v-chip v-if="note.sharp" x-small color="deep-orange lighten-4" class="font-weight-medium">
                      {{ note.sharp }}
                    </v-chip>
                    <span v-else class="grey--text">—</span>
                  </td>
                  <td>
                    <v-chip v-if="note.flat_next" x-small color="blue lighten-4" class="font-weight-medium">
                      {{ note.flat_next }}
                    </v-chip>
                    <span v-else class="grey--text">—</span>
                  </td>
                </tr>
              </tbody>
            </v-simple-table>

            <v-divider class="mb-4" />

            <p class="text-subtitle-1 font-weight-medium mb-2">Que son los sostenidos y bemoles?</p>

            <v-row dense>
              <v-col cols="12" md="6">
                <v-card outlined class="pa-3 mb-3">
                  <div class="d-flex align-center mb-2">
                    <v-icon color="deep-orange" class="mr-2">mdi-arrow-up</v-icon>
                    <span class="font-weight-medium">Sostenido (# · Sharp)</span>
                  </div>
                  <p class="text-body-2 mb-0">
                    Sube la nota <strong>medio tono</strong> (un traste hacia arriba).
                    Ejemplo: Do# / C# esta un traste arriba que Do / C.
                  </p>
                </v-card>
              </v-col>

              <v-col cols="12" md="6">
                <v-card outlined class="pa-3 mb-3">
                  <div class="d-flex align-center mb-2">
                    <v-icon color="blue" class="mr-2">mdi-arrow-down</v-icon>
                    <span class="font-weight-medium">Bemol (b · Flat)</span>
                  </div>
                  <p class="text-body-2 mb-0">
                    Baja la nota <strong>medio tono</strong> (un traste hacia abajo).
                    Ejemplo: Reb / Db es la misma altura que Do# / C# (notas enarmonicas).
                  </p>
                </v-card>
              </v-col>
            </v-row>

            <v-alert type="warning" dense text class="mt-2">
              Entre <strong>Mi-Fa (E-F)</strong> y <strong>Si-Do (B-C)</strong>
              <strong>no hay nota intermedia</strong>: son semitonos naturales y no existe
              un sostenido/bemol entre ellos.
            </v-alert>
          </v-card-text>
        </v-card>

      </v-container>
    </v-expand-transition>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showContent: false,
      ukelele_parts: [
        {
          name: "Clavijeros",
          icon: "mdi-tune",
          description: "Tornillos que tensan o aflojan las cuerdas para ajustar la afinacion.",
        },
        {
          name: "Cejuela (Nut)",
          icon: "mdi-minus",
          description: "Pieza en la parte superior del mastil que guia las cuerdas y define el inicio de la escala.",
        },
        {
          name: "Mastil",
          icon: "mdi-rectangle-outline",
          description: "Parte donde se ubican los trastes y el diapasón; aqui se presionan los acordes.",
        },
        {
          name: "Trastes",
          icon: "mdi-view-column",
          description: "Barras metalicas que dividen el diapasón. Cada traste representa medio tono.",
        },
        {
          name: "Caja de resonancia",
          icon: "mdi-circle-outline",
          description: "Cuerpo hueco de madera que amplifica el sonido de las cuerdas.",
        },
        {
          name: "Boca (Sound hole)",
          icon: "mdi-circle",
          description: "Agujero en la tapa que permite que el sonido salga con mayor proyeccion.",
        },
        {
          name: "Puente (Bridge)",
          icon: "mdi-bridge",
          description: "Fija las cuerdas a la caja y transmite la vibracion a la tapa.",
        },
        {
          name: "Cuerdas",
          icon: "mdi-guitar-pick",
          description: "El ukelele tiene 4 cuerdas, generalmente de nylon o fluorocarbono.",
        },
        {
          name: "Selleta (Saddle)",
          icon: "mdi-minus-thick",
          description: "Pieza en el puente que eleva las cuerdas y define la altura de accion.",
        },
      ],

      tuning_strings: [
        {
          number: "4 (arriba)",
          note_en: "G",
          note_es: "Sol",
          position: "La mas cercana a ti al tocar",
          hint: "Nota reentrante (suena aguda)",
          color: "green darken-1",
        },
        {
          number: "3",
          note_en: "C",
          note_es: "Do",
          position: "Segunda desde arriba",
          hint: "Mas grave de las 4",
          color: "blue darken-1",
        },
        {
          number: "2",
          note_en: "E",
          note_es: "Mi",
          position: "Tercera cuerda",
          hint: "",
          color: "orange darken-1",
        },
        {
          number: "1 (abajo)",
          note_en: "A",
          note_es: "La",
          position: "La mas alejada de ti al tocar",
          hint: "Cuerda mas aguda en pitch estandar",
          color: "red darken-1",
        },
      ],

      notes_table: [
        { latin: "Do", english: "C", sharp: "Do# / C#", flat_next: "Reb / Db" },
        { latin: "Re", english: "D", sharp: "Re# / D#", flat_next: "Mib / Eb" },
        { latin: "Mi", english: "E", sharp: null, flat_next: null },
        { latin: "Fa", english: "F", sharp: "Fa# / F#", flat_next: "Solb / Gb" },
        { latin: "Sol", english: "G", sharp: "Sol# / G#", flat_next: "Lab / Ab" },
        { latin: "La", english: "A", sharp: "La# / A#", flat_next: "Sib / Bb" },
        { latin: "Si", english: "B", sharp: null, flat_next: null },
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