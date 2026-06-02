<template>
  <v-container class="logs-container py-8" fluid>

    <!-- Header -->
    <v-row class="mb-6" align="center">
      <v-col>
        <div class="page-header">
          <div class="d-flex align-center">
            <v-avatar size="48" class="header-avatar mr-4">
              <v-icon size="28" color="white">mdi-message-text-clock</v-icon>
            </v-avatar>
            <div>
              <h1 class="text-h5 font-weight-bold white--text mb-0">WhatsApp Message Logs</h1>
              <span class="caption white--text opacity-75">Monitor sent and failed messages</span>
            </div>
          </div>
        </div>
      </v-col>
      <v-col cols="auto">
        <v-btn
          color="white"
          outlined
          rounded
          small
          :loading="loading"
          @click="fetchLogs"
          class="refresh-btn"
        >
          <v-icon left small>mdi-refresh</v-icon>
          Refresh
        </v-btn>
      </v-col>
    </v-row>

    <!-- Filters Card -->
    <v-card class="filter-card mb-6 rounded-xl elevation-4">
      <v-card-title class="filter-title py-3 px-5">
        <v-icon color="primary" left>mdi-filter-variant</v-icon>
        <span class="font-weight-bold">Filters</span>
        <v-spacer />
        <v-btn text small color="primary" @click="resetFilters">
          <v-icon left x-small>mdi-close-circle-outline</v-icon>
          Clear
        </v-btn>
      </v-card-title>
      <v-divider />
      <v-card-text class="pa-5">
        <v-row>
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="filters.sender"
              label="Sender"
              placeholder="e.g. +5215512345678"
              outlined
              dense
              clearable
              hide-details="auto"
              prepend-inner-icon="mdi-account-arrow-right"
              class="filter-field"
              @keyup.enter="applyFilters"
              @click:clear="applyFilters"
            />
          </v-col>
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="filters.receiver"
              label="Receiver"
              placeholder="e.g. +5215598765432"
              outlined
              dense
              clearable
              hide-details="auto"
              prepend-inner-icon="mdi-account-arrow-left"
              class="filter-field"
              @keyup.enter="applyFilters"
              @click:clear="applyFilters"
            />
          </v-col>
          <v-col cols="12" sm="4">
            <v-select
              v-model="filters.success"
              :items="successOptions"
              label="Status"
              outlined
              dense
              clearable
              hide-details="auto"
              prepend-inner-icon="mdi-check-circle-outline"
              class="filter-field"
              @change="applyFilters"
            />
          </v-col>
        </v-row>
        <v-row class="mt-2">
          <v-col class="d-flex justify-end">
            <v-btn
              color="primary"
              rounded
              small
              :loading="loading"
              @click="applyFilters"
              class="apply-btn"
            >
              <v-icon left small>mdi-magnify</v-icon>
              Search
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Logs Table -->
    <v-card class="table-card rounded-xl elevation-4">
      <v-card-title class="table-title py-3 px-5">
        <v-icon color="teal darken-2" left>mdi-table</v-icon>
        <span class="font-weight-bold">Message History</span>
        <v-spacer />
        <v-chip small color="teal lighten-5" text-color="teal darken-2" class="font-weight-bold">
          {{ pagination.total || 0 }} records
        </v-chip>
      </v-card-title>
      <v-divider />

      <v-data-table
        :headers="headers"
        :items="logs"
        :loading="loading"
        loading-text="Loading message logs..."
        no-data-text="No message logs found"
        hide-default-footer
        class="logs-table"
        :mobile-breakpoint="0"
      >
        <!-- Sender -->
        <template #item.sender="{ item }">
          <div class="d-flex align-center">
            <v-avatar size="28" color="teal lighten-5" class="mr-2">
              <v-icon small color="teal darken-2">mdi-account-arrow-right</v-icon>
            </v-avatar>
            <span class="font-weight-medium caption">{{ item.sender }}</span>
          </div>
        </template>

        <!-- Receiver -->
        <template #item.receiver="{ item }">
          <div class="d-flex align-center">
            <v-avatar size="28" color="blue lighten-5" class="mr-2">
              <v-icon small color="blue darken-2">mdi-account-arrow-left</v-icon>
            </v-avatar>
            <span class="font-weight-medium caption">{{ item.receiver }}</span>
          </div>
        </template>

        <!-- Body -->
        <template #item.body="{ item }">
          <v-tooltip bottom max-width="320">
            <template #activator="{ on, attrs }">
              <span
                v-bind="attrs"
                v-on="on"
                class="body-truncate caption"
              >{{ truncate(item.body, 60) }}</span>
            </template>
            <span style="white-space:pre-wrap">{{ item.body }}</span>
          </v-tooltip>
        </template>

        <!-- Media URL -->
        <template #item.media_url="{ item }">
          <v-tooltip v-if="item.media_url" bottom>
            <template #activator="{ on, attrs }">
              <v-btn
                icon
                x-small
                color="blue darken-1"
                :href="item.media_url"
                target="_blank"
                v-bind="attrs"
                v-on="on"
              >
                <v-icon small>mdi-image-outline</v-icon>
              </v-btn>
            </template>
            <span>{{ item.media_url }}</span>
          </v-tooltip>
          <span v-else class="grey--text text--lighten-1">—</span>
        </template>

        <!-- Success -->
        <template #item.success="{ item }">
          <v-chip
            x-small
            label
            :color="item.success ? 'success' : 'error'"
            :text-color="item.success ? 'white' : 'white'"
            class="font-weight-bold"
          >
            <v-icon x-small left>{{ item.success ? 'mdi-check' : 'mdi-close' }}</v-icon>
            {{ item.success ? 'Sent' : 'Failed' }}
          </v-chip>
        </template>

        <!-- Error Message -->
        <template #item.error_message="{ item }">
          <v-tooltip v-if="item.error_message" bottom max-width="320">
            <template #activator="{ on, attrs }">
              <v-icon small color="error" v-bind="attrs" v-on="on">mdi-alert-circle-outline</v-icon>
            </template>
            <span>{{ item.error_message }}</span>
          </v-tooltip>
          <span v-else class="grey--text text--lighten-1">—</span>
        </template>

        <!-- Sent At -->
        <template #item.sent_at="{ item }">
          <span class="caption">{{ formatDate(item.sent_at) }}</span>
        </template>

        <!-- Created At -->
        <template #item.created_at="{ item }">
          <span class="caption">{{ formatDate(item.created_at) }}</span>
        </template>

        <!-- Created By -->
        <template #item.creator="{ item }">
          <span v-if="item.creator" class="caption">{{ item.creator.name }}</span>
          <span v-else class="grey--text text--lighten-1 caption">system</span>
        </template>
      </v-data-table>

      <!-- Pagination -->
      <v-divider />
      <div class="pagination-footer pa-4 d-flex align-center flex-wrap gap-2">
        <div class="d-flex align-center mr-4">
          <span class="caption grey--text mr-2">Rows per page:</span>
          <v-select
            v-model="perPage"
            :items="[10, 15, 25, 50]"
            dense
            outlined
            hide-details
            style="max-width:80px"
            class="per-page-select"
            @change="applyFilters"
          />
        </div>
        <v-spacer />
        <span class="caption grey--text mr-3">
          {{ paginationLabel }}
        </span>
        <v-btn
          icon
          small
          :disabled="pagination.current_page <= 1 || loading"
          @click="goToPage(pagination.current_page - 1)"
        >
          <v-icon small>mdi-chevron-left</v-icon>
        </v-btn>
        <v-btn
          icon
          small
          :disabled="pagination.current_page >= pagination.last_page || loading"
          @click="goToPage(pagination.current_page + 1)"
        >
          <v-icon small>mdi-chevron-right</v-icon>
        </v-btn>
      </div>
    </v-card>
  </v-container>
</template>

<script>
export default {
  middleware: ['authenticated'],
  layout: 'default',

  data() {
    return {
      logs: [],
      loading: false,
      filters: {
        sender: '',
        receiver: '',
        success: null,
      },
      successOptions: [
        { text: 'Sent', value: 1 },
        { text: 'Failed', value: 0 },
      ],
      perPage: 15,
      pagination: {
        current_page: 1,
        last_page: 1,
        total: 0,
        from: 0,
        to: 0,
      },
      headers: [
        { text: 'Sender',      value: 'sender',        sortable: false },
        { text: 'Receiver',    value: 'receiver',      sortable: false },
        { text: 'Message',     value: 'body',          sortable: false },
        { text: 'Media',       value: 'media_url',     sortable: false, align: 'center' },
        { text: 'Status',      value: 'success',       sortable: false, align: 'center' },
        { text: 'Error',       value: 'error_message', sortable: false, align: 'center' },
        { text: 'Sent At',     value: 'sent_at',       sortable: false },
        { text: 'Created At',  value: 'created_at',    sortable: false },
        { text: 'Created By',  value: 'creator',       sortable: false },
      ],
    }
  },

  computed: {
    paginationLabel() {
      const { from, to, total } = this.pagination
      if (!total) return 'No records'
      return `${from}–${to} of ${total}`
    },
  },

  mounted() {
    this.fetchLogs()
  },

  methods: {
    async fetchLogs(page = 1) {
      this.loading = true
      try {
        const params = {
          page,
          per_page: this.perPage,
        }
        if (this.filters.sender)   params.sender   = this.filters.sender
        if (this.filters.receiver) params.receiver  = this.filters.receiver
        if (this.filters.success !== null && this.filters.success !== undefined) {
          params.success = this.filters.success
        }

        const response = await this.$repository.WhatsappMessageLog.getLogs(params)

        this.logs = response.data
        this.pagination = {
          current_page: response.current_page,
          last_page:    response.last_page,
          total:        response.total,
          from:         response.from,
          to:           response.to,
        }
      } catch (error) {
        console.error('Failed to fetch WhatsApp logs:', error)
        this.$notifier?.showMessage({
          content: 'Failed to load message logs.',
          color: 'error',
        })
      } finally {
        this.loading = false
      }
    },

    applyFilters() {
      this.fetchLogs(1)
    },

    resetFilters() {
      this.filters = { sender: '', receiver: '', success: null }
      this.applyFilters()
    },

    goToPage(page) {
      this.fetchLogs(page)
    },

    truncate(text, length) {
      if (!text) return ''
      return text.length > length ? text.substring(0, length) + '…' : text
    },

    formatDate(dateStr) {
      if (!dateStr) return '—'
      const d = new Date(dateStr)
      return d.toLocaleString('es-MX', {
        year:   'numeric',
        month:  '2-digit',
        day:    '2-digit',
        hour:   '2-digit',
        minute: '2-digit',
      })
    },
  },
}
</script>

<style scoped>
.logs-container {
  min-height: 100vh;
  background: linear-gradient(160deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
}

.page-header {
  padding: 0;
}

.header-avatar {
  background: linear-gradient(135deg, #075e54, #25d366);
  box-shadow: 0 4px 16px rgba(37, 211, 102, 0.35);
}

.refresh-btn {
  border-color: rgba(255, 255, 255, 0.5) !important;
  color: white !important;
  letter-spacing: 0.3px;
}

/* Filter card */
.filter-card {
  border: 1px solid rgba(0, 150, 136, 0.15) !important;
}

.filter-title {
  background: linear-gradient(90deg, #e0f7f4 0%, #f5fffe 100%);
}

.filter-field >>> .v-input__slot {
  background: #f8fdfd !important;
}

.apply-btn {
  text-transform: none;
  letter-spacing: 0.3px;
  min-width: 110px;
}

/* Table card */
.table-card {
  border: 1px solid rgba(0, 150, 136, 0.12) !important;
}

.table-title {
  background: linear-gradient(90deg, #e8f5f3 0%, #f5fffe 100%);
}

.logs-table >>> thead tr th {
  background: #f0fafa !important;
  font-size: 0.78rem !important;
  font-weight: 700 !important;
  color: #006064 !important;
  letter-spacing: 0.6px;
  white-space: nowrap;
}

.logs-table >>> tbody tr:hover {
  background: rgba(37, 211, 102, 0.04) !important;
  transition: background 0.2s ease;
}

.body-truncate {
  color: #37474f;
  cursor: default;
}

.pagination-footer {
  background: #fafafa;
}

.per-page-select >>> .v-input__slot {
  min-height: 32px !important;
  font-size: 0.8rem;
}
</style>
