<template>
  <v-dialog :value="true" persistent width="400px">
    <v-card>
      <v-card-title>
        <v-icon class="mr-2">mdi-alert</v-icon>
        <span class="text-h5">{{ formTitle }}</span>
        <v-spacer />
        <v-icon @click.native="close">$delete</v-icon>

      </v-card-title>

      <v-card-text>
        <div class="text-body-1 text--primary">Esta seguro de elminar el Usuario
          <strong>{{item.name}}</strong> ?
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="grey" class="mr-2" outlined @click.native="close">
          NO
        </v-btn>
        <v-btn color="primary" @click.native="ok">
          SI
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: ["value", "userx"],
  data() {
    return {
      item: {}
    };
  },
  computed: {
    formTitle() {
      return "Confirmación";
    }
  },
  methods: {
    close() {
      this.$emit("close");
    },
    ok() {
      this.$emit("ok", this.item);
    }
  },
  mounted() {
    if (this.userx) {
      this.item = this.userx;
    }
  }
}
</script>
