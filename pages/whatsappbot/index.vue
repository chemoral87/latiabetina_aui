<template>
  <v-container class="whatsapp-bot-container py-12" fluid>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6" lg="5">
        <v-card class="bot-card elevation-24 rounded-xl overflow-hidden">
          <div class="header-gradient pa-6 text-center">
            <v-avatar size="64" class="mb-4 glass-avatar">
              <v-icon size="40" color="white">mdi-whatsapp</v-icon>
            </v-avatar>
            <h1 class="text-h4 font-weight-bold white--text mb-2">WhatsApp Bot</h1>
            <v-chip :color="statusColor" small label class="status-chip font-weight-black" dark>
              <v-icon left x-small :class="{ 'blink': botStatus !== 'READY' }">mdi-circle</v-icon>
              {{ botStatus }}
            </v-chip>
          </div>

          <v-card-text class="pa-8">
            <v-form ref="form" v-model="valid" lazy-validation>
              <div class="input-group mb-6">
                <label class="d-block mb-2 font-weight-bold grey--text text--darken-2">Recipient Phone</label>
                <v-text-field v-model="phone" placeholder="e.g. 5215512345678" outlined rounded dense
                  hide-details="auto" prepend-inner-icon="mdi-phone" :rules="[v => !!v || 'Phone is required']"
                  class="custom-field"></v-text-field>
                <small class="grey--text pl-4 mt-1 d-block">Include country code (e.g., 521 for MX)</small>
              </div>

              <div class="input-group mb-8">
                <label class="d-block mb-2 font-weight-bold grey--text text--darken-2">Your Message</label>
                <v-textarea v-model="message" placeholder="Type your message here..." outlined rounded rows="4"
                  hide-details="auto" prepend-inner-icon="mdi-message-text" :rules="[v => !!v || 'Message is required']"
                  class="custom-field"></v-textarea>
              </div>

              <v-btn block x-large color="success" class="send-btn rounded-pill font-weight-bold elevation-8"
                :loading="sending" @click="sendWhatsAppMessage">
                <v-icon left>mdi-send</v-icon>
                Send Message
              </v-btn>
            </v-form>

            <v-fade-transition>
              <v-alert v-if="response" :type="response.type" class="mt-6 rounded-lg" border="left" text>
                {{ response.text }}
              </v-alert>
            </v-fade-transition>

            <div v-if="botStatus === 'QR_RECEIVED'" class="mt-6 text-center qr-instruction pa-4 rounded-lg">
              <v-icon color="warning" class="mb-2">mdi-qrcode-scan</v-icon>
              <p class="mb-0 warning--text font-weight-medium">
                Bot needs authentication.
                <a :href="'http://' + (typeof window !== 'undefined' ? window.location.hostname : 'localhost') + ':3007/qr?pw=1d57b68c-55b5-4fd7-af7f-83c0518e6110'"
                  target="_blank" class="font-weight-bold">Scan QR Code Here</a>
              </p>
            </div>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions class="pa-4 grey lighten-5">
            <v-icon small color="grey darken-1" class="ml-2">mdi-api</v-icon>
            <span class="caption grey--text text--darken-1 ml-2">WhatsApp Bot API</span>
            <v-spacer></v-spacer>
            <v-btn text color="primary" small @click="checkStatus" :loading="checking">
              <v-icon left small>mdi-refresh</v-icon>
              Refresh Status
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>

export default {
  middleware: ["authenticated"],
  layout: 'default',
  data() {
    return {
      valid: true,
      phone: '',
      message: '',
      botStatus: 'CHECKING...',
      statusColor: 'grey',
      sending: false,
      checking: false,
      response: null,
      statusInterval: null
    };
  },
  mounted() {
    this.checkStatus();
    this.statusInterval = setInterval(this.checkStatus, 5000);
  },
  beforeDestroy() {
    if(this.statusInterval) clearInterval(this.statusInterval);
  },
  methods: {
    async checkStatus() {
      this.checking = true;
      try {
        // Using the new Repository pattern
        const data = await this.$repository.Whatsapp.status();
        this.botStatus = data.status;

        switch(data.status) {
          case 'READY':
            this.statusColor = 'success';
            break;
          case 'QR_RECEIVED':
            this.statusColor = 'warning';
            break;
          case 'INITIALIZING':
          case 'LOADING':
            this.statusColor = 'info';
            break;
          default:
            this.statusColor = 'error';
        }
      } catch(error) {
        console.error('WhatsApp Bot Status Check Failed:', error.message);
        this.botStatus = 'OFFLINE';
        this.statusColor = 'error';
      } finally {
        this.checking = false;
      }
    },
    async sendWhatsAppMessage() {
      if(!this.$refs.form.validate()) return;

      // this.sending = true;
      this.response = null;

      try {
        // Using the new Repository pattern
        const data = await this.$repository.Whatsapp.sendMessage({
          phone: this.phone,
          message: this.message
        });

        this.response = {
          type: 'success',
          text: `Message sent successfully! ID: ${data.id}`
        };
        // this.message = ''; // Clear message after success

        // Clear success message after 5 seconds
        setTimeout(() => {
          if(this.response && this.response.type === 'success') {
            this.response = null;
          }
        }, 5000);

      } catch(error) {
        console.error(error);
        this.response = {
          type: 'error',
          text: error.response?.data?.error || 'Failed to send message. Is the bot connected?'
        };
      } finally {
        this.sending = false;
      }
    }
  }
};
</script>

<style scoped>
.whatsapp-bot-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #eef2f7 0%, #dee2e6 100%);
  display: flex;
  align-items: center;
}

.bot-card {
  border: none;
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
}

.header-gradient {
  background: linear-gradient(135deg, #075e54 0%, #25d366 100%);
  position: relative;
}

.glass-avatar {
  background: rgba(255, 255, 255, 0.15) !important;
  border: 2px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
}

.status-chip {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.blink {
  animation: blink-animation 1s steps(5, start) infinite;
}

@keyframes blink-animation {
  to {
    visibility: hidden;
  }
}

.custom-field>>>.v-input__slot {
  background: #f1f5f9 !important;
  transition: all 0.3s ease;
  border: 1px solid transparent !important;
}

.custom-field.v-input--is-focused>>>.v-input__slot {
  background: #fff !important;
  border: 1px solid #25d366 !important;
  box-shadow: 0 0 0 4px rgba(37, 211, 102, 0.1) !important;
}

.send-btn {
  text-transform: none;
  letter-spacing: 0.5px;
  height: 60px !important;
  font-size: 1.1rem !important;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.send-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 24px rgba(37, 211, 102, 0.4) !important;
}

.qr-instruction {
  background: rgba(255, 152, 0, 0.1);
  border: 1px dashed #fb8c00;
}

.qr-instruction a {
  color: #ef6c00;
  text-decoration: none;
}

.qr-instruction a:hover {
  text-decoration: underline;
}
</style>
