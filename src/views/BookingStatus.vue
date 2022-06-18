<template>
  <div class="page-booking-status">
    <div class="panel-title position-relative w-100 title">
      <p>{{ $t('booking.title') }}</p>
    </div>

    <booking-status-confirm-modal ref="confirmModal" @ok="changeStatus" :pending="propertiesPending" />

    <i18n path="booking.heading" tag="p" class="status">
      <template #all><b>{{ $t('booking.all') }}</b></template>
      <template #mode>
        <b :class="`text-${hotel.active ? 'success' : 'danger'}`">
          {{ $t(`booking.${hotel.active ? 'bookable' : 'unbookable'}`) }}
        </b>
      </template>
    </i18n>
    <p class="status">
      {{ $t(`booking.tip${hotel.active ? 'On' : 'Off'}`) }}
    </p>
    <switcher :checked="hotel.active" colored lazy
              :on-label="$t('booking.on')" :off-label="$t('booking.off')"
              @willChange="showConfirm" :disabled="hotelsPending" />

    <p class="logs-title"></p>
    <Tabs :items="tabs" v-model="activeTab" withContent>
      <template #tab(1)>
        <div class="logs-table d-none d-md-block" v-if="logsLoaded">
          <table class="w-100 text-left">
            <thead>
              <tr>
                <th class="w-id">{{ $t('id') }}</th>
                <th class="w-name">{{ $t('booking.username') }}</th>
                <th class="w-date">{{ $t('booking.date') }}</th>
                <th class="w-status">{{ $t('booking.changedTo') }}</th>
              </tr>
            </thead>
            <tbody v-if="!booking.length">
              <tr>
                <td colspan="4" class="w-empty">{{ $t('booking.noLogs') }}</td>
              </tr>
            </tbody>
            <tbody v-for="log in booking" :key="`log-${log.id}`">
              <tr class="separator before"></tr>
              <tr>
                <td>{{ log.user ? log.user.id : '' }}</td>
                <td><p>{{ log.user ? log.user.profile.name : '' }}</p></td>
                <td><p>{{ createDate(log) }}</p></td>
                <td>
                  <switcher :checked="log.status" disabled
                            :on-label="$t('booking.on')" :off-label="$t('booking.off')"/>
                </td>
              </tr>
              <tr class="separator after"></tr>
            </tbody>
          </table>
        </div>

        <div class="d-md-none">
          <mobile-table>
            <template #mobile>
              <li v-for="log in booking" :key="log.id">
                <div class="row">
                  <div class="col-6">
                    <h6 class="font-weight-bold">{{ $t('id') }}</h6>
                    <p>{{ log.user ? log.user.id : '' }}</p>
                  </div>
                  <div class="col-6">
                    <h6 class="font-weight-bold">{{ $t('booking.date') }}</h6>
                    <p>{{ createDate(log) }}</p>
                  </div>
                  <div class="col-6">
                    <h6 class="font-weight-bold">{{ $t('booking.username') }}</h6>
                    <p>{{ log.user ? log.user.profile.name : '' }}</p>
                  </div>
                  <div class="col-6">
                    <h6 class="font-weight-bold">{{ $t('booking.changedTo') }}</h6>
                    <switcher :checked="log.status" disabled
                              :on-label="$t('booking.on')" :off-label="$t('booking.off')"/>
                  </div>
                </div>
              </li>
            </template>
          </mobile-table>
        </div>
      </template>
      <template #tab(2)>
        <div class="d-flex align-items-center justify-content-between p-3">
          <span>{{ $t('booking.roomdbMaster') }}</span>
          <switcher
            colored
            :checked="property.roomdb_is_master"
            :on-label="$t('yes')"
            :off-label="$t('no')"
            :disabled="propertiesPending"
            @change="updateRoomdbIsMaster"
          />
        </div>
      </template>
    </Tabs>
  </div>
</template>

<script>
  import { mapActions, mapGetters, mapState } from 'vuex';
  import moment from 'moment';
  import BookingStatusConfirmModal from '@/components/BookingStatusConfirmModal.vue';
  import MobileTable from '../components/MobileTable.vue';

  export default {
    name: 'BookingStatus',
    components: { MobileTable, BookingStatusConfirmModal },
    data() {
      return {
        confirm: false,
        activeTab: 1,
        tabs: [
          { id: 1, title: this.$t('booking.titleLogs') },
          { id: 2, title: this.$t('booking.titleMaster') },
        ],
      };
    },
    async created() {
      this.fetchLogs({ key: 'booking', id: this.property.id, forced: true });
      await this.getProperty();
    },
    computed: {
      ...mapState('user', ['propertiesPending']),
      ...mapGetters('user', ['property']),
      ...mapGetters('logs', ['booking']),
      logsLoaded() {
        return this.booking != null;
      },
    },
    methods: {
      ...mapActions('user', ['getProperty', 'togglePropertyStatus', 'updateProperty']),
      ...mapActions('logs', ['fetchLogs']),
      createDate(row) {
        return moment(row.created_at).format(this.$t('booking.dateFormat'));
      },
      showConfirm(futureStatus) {
        this.$refs.confirmModal.show(futureStatus);
      },
      async changeStatus({ status }) {
        const { id } = this.property;
        try {
          await this.togglePropertyStatus({ id, active: status });
          this.$refs.confirmModal.hide();
        } catch (error) {
          this.$toastr.e(error.message, this.$t('error'));
        }
      },
      async updateRoomdbIsMaster(val) {
        await this.updateProperty({
          partial: true,
          id: this.property.id,
          roomdb_is_master: val,
        });
      },
    },
  };
</script>
