<template>
  <div class="page-reservations" id="page-reservations">
    <div class="panel search-form">
      <div class="panel-title position-relative w-100 title">
        <p>{{ $t('reservations.pageTitle') }}</p>
      </div>
      <b-alert v-if="pmsError" variant="danger" show>
        <h4 class="alert-heading">{{ $t('error') }}</h4>
        <p class="mb-0">{{ pmsError.response ? pmsError.response.data.message : pmsError }}</p>
      </b-alert>
      <div v-else class="row pt-3">
        <div class="col-12 cell-search-for">
          <label class="text-xs mb-1" for="search-for">{{ $t('reservations.searchFor') }}</label>
          <drop-down
            id="search-for"
            :disabled="pending"
            :items="searchForItems"
            v-model="searchFor"
          />
        </div>
        <div class="col-12 cell-date-picker">
          <label class="text-xs mb-1" for="date-from">{{ $t('reservations.dateFrom') }}</label>
          <date-picker id="date-from" v-model="minDate"
                       :disabled="pending" :format="dateFormat" @input="fromChanged" />
        </div>
        <div class="col-12 cell-date-picker">
          <label class="text-xs mb-1" for="date-from">{{ $t('reservations.dateUntil') }}</label>
          <date-picker id="date-until" v-model="maxDate"
                       :disabled="pending" :format="dateFormat" @input="untilChanged" />
        </div>
        <div class="col-12 cell-buttons">
          <b-button variant="secondary"
                    :disabled="pending" @click="show">
            {{ $t('reservations.buttonShow') }}
          </b-button>
          <b-button variant="outline-primary"
                    :disabled="pending" @click="show">
            {{ $t('reservations.buttonFilters') }}
          </b-button>
        </div>
      </div>
    </div>

    <b-modal
      no-close-on-backdrop
      id="cancelModal"
      ref="cancelModal"
      no-fade
      centered
      static
      size="md"
      modal-class="cancel-modal"
      :ok-title="cancelTitle"
      ok-variant="danger"
      ok-only
      :ok-disabled="pending || !$refs.cancelForm || !$refs.cancelForm.flags.valid"
      :no-close-on-esc="pending"
      :hide-header-close="pending"
      @ok.prevent="processCancel"
      @hidden="cancelModalDidHide"
    >
      <template #modal-header-close>
        <icon width="20" height="20" class="d-none d-md-block" type="times"/>
        <icon width="10" height="18" class="d-md-none" type="arrow-left"/>
      </template>
      <template #modal-title>
        {{ cancelTitle }}
      </template>
      <p class="text-md">
        {{ $t(`reservations.text-${cancelRecord.noshow ? 'noshow' : 'cancel'}`) }}
        {{ $t('reservations.textWarning') }}
      </p>
      <p class="text-md text-danger">
        {{ $t(`reservations.confirm-${cancelRecord.noshow ? 'noshow' : 'cancel'}`, {
          id: cancelRecord.id
        }) }}
      </p>
      <p class="form">
        <b-form-group class="m-0">
          <ValidationObserver ref="cancelForm" slim>
            <ValidatedField rules="required|max:100"
                            name="cancel-reason"
                            type="text"
                            :placeholder="$t('reservations.reason')"
                            local
                            v-model="cancelRecord.reason"
                            :disabled="pending"
            />
          </ValidationObserver>
        </b-form-group>
      </p>
    </b-modal>

    <b-modal
      no-close-on-backdrop
      id="personModal"
      no-fade
      centered
      ok-only
      :ok-title="$t('reservations.closeButton')"
      static
      size="lg"
      modal-class="person-modal"
      @hidden="personModalDidHide"
    >
      <template #modal-header-close>
        <icon width="20" height="20" class="d-none d-md-block" type="times"/>
        <icon width="10" height="18" class="d-md-none" type="arrow-left"/>
      </template>
      <template #modal-title>
        {{ $t('reservations.personModalTitle', { id: shownRecord.id }) }}
      </template>
      <div class="columns">
        <div class="persons">
          <div class="title">
            <span>
              <icon width="20" height="20" type="map-tag"/>
            </span>
            <h3>{{ $t('reservations.bookerAddress') }}</h3>
          </div>
          <p v-if="!profile(shownRecord, 'booker')"><i>{{ $t('reservations.noData') }}</i></p>
          <p v-else v-for="(text, idx) in profile(shownRecord, 'booker')" :key="`bp-${idx}`">{{ text }}</p>
          <div v-if="!profile(shownRecord, 'guests')">
            <div class="title">
              <span>
                <icon width="20" height="20" type="map-tag"/>
              </span>
              <h3>{{ $t('reservations.guestAddress') }}</h3>
            </div>
            <p><i>{{ $t('reservations.noData') }}</i></p>
          </div>
          <div v-else v-for="(guest, idx) in profile(shownRecord, 'guests')" :key="`gp-${idx}`">
            <div class="title">
              <span>
                <icon width="20" height="20" type="map-tag"/>
              </span>
              <h3>{{ $t('reservations.guestAddress') }}</h3>
            </div>
            <p v-for="(text, gidx) in guest" :key="`gp-${idx}-${gidx}`">{{ text }}</p>
          </div>
        </div>
        <div class="notes">
          <div class="title">
            <span>
              <icon width="20" height="20" type="bubble-square-left"/>
            </span>
            <h3>{{ $t('reservations.guestRemarks') }}</h3>
          </div>
          <p v-if="!remarks(shownRecord, 'booker')">
            <i>{{ $t('reservations.noRemarks') }}</i>
          </p>
          <p v-else v-for="(text, idx) in remarks(shownRecord, 'booker')" :key="`br-${idx}`">{{ text }}</p>
          <div class="title">
            <span>
              <icon width="20" height="20" type="bubble-square-left"/>
            </span>
            <h3>{{ $t('reservations.roomRemarks') }}</h3>
          </div>
          <p v-if="!remarks(shownRecord, 'room')">
            <i>{{ $t('reservations.noRemarks') }}</i>
          </p>
          <p v-else v-for="(text, idx) in remarks(shownRecord, 'room')" :key="`rr-${idx}`">{{ text }}</p>
          <div class="title">
            <span>
              <icon width="20" height="20" type="bubble-square-left"/>
            </span>
            <h3>{{ $t('reservations.channelRemarks') }}</h3>
          </div>
          <p v-if="!remarks(shownRecord, 'channel')">
            <i>{{ $t('reservations.noRemarks') }}</i>
          </p>
          <p v-else v-for="(text, idx) in remarks(shownRecord, 'channel')" :key="`cr-${idx}`">{{ text }}</p>
        </div>
      </div>
    </b-modal>

    <b-modal
      no-close-on-backdrop
      id="creditCardModal"
      ref="creditCardModal"
      no-fade
      centered
      static
      size="lg"
      modal-class="credit-card-modal"
      hide-footer
    >
      <template #modal-header-close>
        <icon width="20" height="20" class="d-none d-md-block" type="times"/>
        <icon width="10" height="18" class="d-md-none" type="arrow-left"/>
      </template>
      <template #modal-title>
        {{ $t('reservations.creditCardDetailsModalTitle') }}
      </template>
      <vue-recaptcha
        ref="recaptcha"
        size="invisible"
        :sitekey="siteKey">
      </vue-recaptcha>
      <p class="text-md">
        <spinner v-if="pending || !iframeLoaded" />
        <span v-if="iframeLoaded && !pending" v-html="iframe.body"></span>
      </p>
    </b-modal>

    <div class="d-md-none btn-excel-sm" v-if="loaded && !empty">
      <b-btn variant="outline-primary" class="w-100">
        {{ $t('reservations.buttonExcelDownload') }}
        <icon width="11" height="14" class="ml-1" type="download"/>
      </b-btn>
    </div>

    <div class="list-item d-md-none" v-if="loaded && empty">
      <div class="nothing">
        {{ $t('reservations.noBookings') }}
      </div>
    </div>
    <div v-if="loaded" class="d-md-none">
      <div class="list-item" v-for="row in sortedList" :key="row.id">
        <div class="d-flex">
          <div class="nr">
            <p class="label">{{ $t('reservations.qty') }}</p>
          </div>
          <div class="flex-grow-1">
            <p class="label">{{ $t('reservations.room') }}</p>
          </div>
          <div class="dots">
            <icon width="20" height="19" class="label" type="dots-h"/>
          </div>
        </div>
        <div class="d-flex" v-for="ct in row.content" :key="ct.rid">
          <div class="nr">
            <p class="small">{{ ct.amt }}&nbsp;&times;</p>
          </div>
          <div class="flex-grow-1">
            <p>{{ ct.name }} (ID {{ ct.rid }})</p>
          </div>
          <!-- <div class="dots"></div> -->
        </div>
        <div class="d-flex">
          <div class="check">
            <p class="label">
              {{ $t('reservations.checkIn') }}
              <icon width="12" height="19" type="calendar"/>
            </p>
            <p>{{ formatDate(row.checkin_at) }}</p>
          </div>
          <div class="check pad-left">
            <p class="label">
              {{ $t('reservations.checkOut') }}
              <icon width="12" height="19" type="calendar"/>
            </p>
            <p>{{ formatDate(row.checkout_at) }}</p>
          </div>
        </div>
        <div>
          <p class="marker">{{ $tc('reservations.nights', row.nights) }}</p>
        </div>
        <div class="d-flex">
          <div class="w-50">
            <p class="label">{{ $t('reservations.guest') }}</p>
            <p>
              <span class="person"
                    v-b-modal.personModal
                    @click="preparePersonModal(row)">{{ row.person }}</span>
              (<span class="text-nowrap">{{ $tc('reservations.guests', row.guests.amt) }}</span>)
            </p>
          </div>
          <div class="flex-grow-1 pad-left">
            <p class="label">{{ $t('reservations.status') }}</p>
            <p class="small">
              <span class="status" :class="{ ok: row.ok }">
                <b-dropdown v-if="row.ok" size="sm" toggle-tag="span" variant="link" no-caret>
                  <template #button-content>
                    {{ $t(`reservations.status${row.type}`) }}
                    <icon width="13" height="24" v-if="row.ok" type="pencil"/>
                  </template>
                  <b-dropdown-item
                    v-b-modal.cancelModal
                    @click="prepareCancelModal(row.id)"
                  >{{ $t('reservations.cancel') }}</b-dropdown-item>
                  <b-dropdown-item
                    v-b-modal.cancelModal
                    @click="prepareCancelModal(row.id, true)"
                    :disabled="!canNoShow(row.checkin_at)"
                  >{{ $t('reservations.noShow') }}</b-dropdown-item>
                </b-dropdown>
                <span v-else>{{ $t(`reservations.status${row.type}`) }}</span>
              </span>
            </p>
          </div>
          <b-popover
            v-if="remarks(row, 'booker')"
            custom-class="notes-popover"
            no-fade
            :target="`sm-notes-${row.id}`"
            triggers="focus"
            placement="bottomleft"
            container="page-reservations"
            :ref="`notes-popover-sm-${row.id}`"
          >
            <div class="note-block">
              <div class="note-header">
                <figure class="avatar"></figure>
                <span>{{ row.person }}</span>
              </div>
              <p>{{ remarks(row, 'booker')[0] }}</p>
            </div>
            <div class="note-footer">
              <b-btn size="sm" variant="outline-primary"
                     @click="hideNotesPopover(row.id, 'sm')">{{ $t('reservations.buttonCancel') }}</b-btn>
              <!-- <b-btn size="sm" variant="secondary">{{ $t('reservations.buttonReply') }}</b-btn> -->
            </div>
          </b-popover>
          <div class="notes-cell">
            <div class="notes" tabindex="-1" :id="`sm-notes-${row.id}`">
              <icon width="25" height="25" type="bubble-square-left"/>
              <span class="count" v-if="remarks(row, 'booker')">{{ row.notes }}</span>
            </div>
          </div>
        </div>
        <p class="label">{{ $t('reservations.ratePlan') }}</p>
        <p v-for="ct in row.content" :key="ct.pid">
          {{ ct.plan }} (ID {{ ct.pid }})
        </p>
        <div class="d-flex">
          <div class="w-50">
            <p class="label">{{ $t('reservations.totalPrice') }}</p>
            <p class="total-price" :id="`price-${row.id}`" tabindex="0">
              {{ formatPrice(row.total.price, row.total.cur) }}
            </p>
            <b-popover
              :target="`price-${row.id}`"
              custom-class="price-popover"
              triggers="focus"
              placement="bottom"
              container="page-reservations"
            >
              <div v-for="(plan, idx) in row.content" :key="idx">
                <hr v-if="idx > 0">
                <p class="muted">{{ formatDate(plan.from) }} ~ {{ formatDate(plan.till) }}</p>
                <p>
                  {{ plan.amt }}&nbsp;&times;&nbsp;{{ plan.name }}
                  ID {{ plan.rid }},
                  PID {{ plan.pid }}
                </p>
                <p>
                  <b>{{
                    $tc('reservations.total', formatPrice(plan.amt * plan.price * getDays(plan), plan.cur))
                  }}</b>
                  ({{ $tc('reservations.perNight', formatPrice(plan.price, plan.cur)) }})
                </p>
              </div>
            </b-popover>
          </div>
          <div class="w-50 pad-left">
            <p class="label">{{ $t('reservations.creditCard') }}</p>
            <p
              v-b-modal.creditCardModal
              class="credit-card"
              @click="prepareCreditCardModal(row)"
            >{{ $t('reservations.buttonDetails') }}</p>
          </div>
        </div>
        <p class="label">{{ $t('reservations.bookingDate') }}</p>
        <p>{{ formatDate(row.created_at, true) }}</p>
        <p class="label">{{ $t('reservations.channel') }}</p>
        <p>{{ row.source.name }} (ID {{ row.source.id }})</p>
      </div>
      <pagination
        v-if="loaded && !empty"
        :perPage="resultPerPage"
        :currentPage="currentPage"
        :totalRows="totalItems"
        alignment="center"
        @update:per-page="updateResultPerPage($event)"
        @update:current-page="updateCurrentPage($event)" />
    </div>

    <div class="list d-none d-md-block" v-if="loaded">
      <div class="nothing" v-if="empty">
        {{ $t('reservations.noBookings') }}
      </div>
      <div v-else>
        <table class="w-100">
          <thead>
            <tr>
              <th>{{ $t('reservations.guest') }}</th>
              <th class="text-nowrap">{{ $t('reservations.checkIn') }}</th>
              <th class="text-nowrap">{{ $t('reservations.checkOut') }}</th>
              <th class="text-right">{{ $t('reservations.qty') }}</th>
              <th>{{ $t('reservations.room') }}</th>
              <th>{{ $t('reservations.ratePlan') }}</th>
              <th>{{ $t('reservations.totalPrice') }}</th>
              <th>{{ $t('reservations.status') }}</th>
              <th>{{ $t('reservations.creditCard') }}</th>
              <th>{{ $t('reservations.bookingDate') }}</th>
              <th>{{ $t('reservations.notes') }}</th>
              <th class="text-right">
                {{ $t('reservations.channel') }}
                <br>
                {{ $t('reservations.bookingId') }}
              </th>
            </tr>
          </thead>
          <tbody v-for="row in sortedList" :key="row.id">
            <tr class="separator before"></tr>
            <tr>
              <td class="first" :rowspan="row.rs">
                <p><span class="person"
                         v-b-modal.personModal
                         @click="preparePersonModal(row)">{{ row.person }}</span></p>
                <p class="guests text-nowrap">
                  {{ $tc('reservations.guests',row.guests.amt) }}
                  <span v-b-tooltip.hover.bottomright :title="guestsCount(row.guests)">
                    <icon width="14" height="14" type="info"/>
                  </span>
                </p>
              </td>
              <td :rowspan="row.rs">
                <div class="check in">
                  <span>{{ formatDate(row.checkin_at) }}</span>
                  <span class="marker">{{ $tc('reservations.nights', row.nights) }}</span>
                </div>
              </td>
              <td :rowspan="row.rs">
                <div class="check out">
                  <span>{{ formatDate(row.checkout_at) }}</span>
                  <span class="marker"></span>
                </div>
              </td>
              <td class="nr text-right">
                {{ row.content[0].amt }}&nbsp;&times;
              </td>
              <td>
                <p>{{ row.content[0].name }}</p>
                <p class="text-nowrap">ID {{ row.content[0].rid }}</p>
              </td>
              <td>
                <p>{{ row.content[0].plan ? row.content[0].plan : '-' }}</p>
                <p class="text-nowrap">ID {{ row.content[0].pid }}</p>
              </td>
              <td :rowspan="row.rs">
                <span class="total-price" :id="`total-price-${row.id}`" tabindex="0">
                  {{ formatPrice(row.total.price, row.total.cur) }}
                </span>
                <b-popover
                  :target="`total-price-${row.id}`"
                  custom-class="price-popover"
                  triggers="focus"
                  placement="bottom"
                  container="page-reservations"
                >
                  <div v-for="(plan, idx) in row.content" :key="idx">
                    <hr v-if="idx > 0">
                    <p class="muted">{{ formatDate(plan.from) }} ~ {{ formatDate(plan.till) }}</p>
                    <p>
                      {{ plan.amt }}&nbsp;&times;&nbsp;{{ plan.name }}
                      ID {{ plan.rid }},
                      PID {{ plan.pid }}
                    </p>
                    <p>
                      <b>{{
                        $tc('reservations.total', formatPrice(plan.amt * plan.price * getDays(plan), plan.cur))
                      }}</b>
                      ({{ $tc('reservations.perNight', formatPrice(plan.price, plan.cur)) }})
                    </p>
                  </div>
                </b-popover>
              </td>
              <td :rowspan="row.rs">
                <span class="status" :class="{ ok: row.ok }">
                  <b-dropdown v-if="row.ok" size="sm" toggle-tag="span" variant="link" no-caret>
                    <template #button-content>
                      {{ $t(`reservations.status${row.type}`) }}
                      <icon width="13" height="12" type="pencil"/>
                    </template>
                    <b-dropdown-item
                      v-b-modal.cancelModal
                      @click="prepareCancelModal(row.id)"
                    >{{ $t('reservations.cancel') }}</b-dropdown-item>
                    <b-dropdown-item
                      v-b-modal.cancelModal
                      @click="prepareCancelModal(row.id, true)"
                      :disabled="!canNoShow(row.checkin_at)"
                    >{{ $t('reservations.noShow') }}</b-dropdown-item>
                  </b-dropdown>
                  <span v-else>{{ $t(`reservations.status${row.type}`) }}</span>
                </span>
              </td>
              <td :rowspan="row.rs">
                <span
                  v-b-modal.creditCardModal
                  class="credit-card"
                  @click="prepareCreditCardModal(row)"
                >{{ $t('reservations.buttonDetails') }}</span>
              </td>
              <td :rowspan="row.rs" class="booking-date" v-html="formatDate(row.created_at, true, true)"></td>
              <td :rowspan="row.rs">
                <b-popover
                  v-if="remarks(row, 'booker')"
                  custom-class="notes-popover"
                  :target="`notes-${row.id}`"
                  triggers="focus"
                  placement="bottomleft"
                  container="page-reservations"
                  :ref="`notes-popover-${row.id}`"
                >
                  <div class="note-block">
                    <div class="note-header">
                      <figure class="avatar"></figure>
                      <span>{{ row.person }}</span>
                    </div>
                    <p>{{ remarks(row, 'booker')[0] }}</p>
                  </div>
                  <div class="note-footer">
                    <b-btn size="sm" variant="outline-primary"
                           @click="hideNotesPopover(row.id)">{{ $t('reservations.buttonCancel') }}</b-btn>
                    <!-- <b-btn size="sm" variant="secondary">{{ $t('reservations.buttonReply') }}</b-btn> -->
                  </div>
                </b-popover>
                <div class="notes" :id="`notes-${row.id}`" tabindex="-1">
                  <icon width="25" height="25" type="bubble-square-left"/>
                  <span class="count" v-if="remarks(row, 'booker')">{{ row.notes }}</span>
                </div>
              </td>
              <td class="source last" :rowspan="row.rs">
                <p>{{ row.source.name }}</p>
                <p class="text-nowrap">ID {{ row.source.id }}</p>
              </td>
            </tr>
            <fragment v-if="row.rs > 1">
              <tr v-for="(item, idx) in row.content.slice(1)" :key="`rooms-${row.id}-${idx+1}`" class="more-items">
                <td class="nr text-right">
                  {{ item.amt }}&nbsp;&times;
                </td>
                <td>
                  <p>{{ item.name }}</p>
                  <p class="text-nowrap">ID {{ item.rid }}</p>
                </td>
                <td>
                  <p>{{ item.plan }}</p>
                  <p class="text-nowrap">ID {{ item.pid }}</p>
                </td>
              </tr>
            </fragment>
            <tr class="separator after"></tr>
          </tbody>
        </table>
      </div>
      <pagination
        v-if="loaded && !empty && totalItems > minPaginationPerPage"
        :perPage="resultPerPage"
        :currentPage="currentPage"
        :totalRows="totalItems"
        :disabled="pending"
        @update:per-page="updateResultPerPage($event)"
        @update:current-page="updateCurrentPage($event)" />
    </div>
  </div>
</template>

<script>
  import moment from 'moment';
  import { mapState, mapGetters, mapActions } from 'vuex';
  import { PMSError } from '@/errors';
  import Pagination from '@/components/Pagination.vue';
  import { minPaginationPerPage } from '@/shared';
  import { formatNumber } from '@/helpers';
  import VueRecaptcha from 'vue-recaptcha';

  export default {
    name: 'Reservations',
    components: { Pagination, VueRecaptcha },
    data() {
      return {
        minDate: null,
        maxDate: null,
        today: null,
        dateFormat: null,
        currentPage: 1,
        resultPerPage: 50,
        searchFor: 1,
        shownRecord: {},
        cancelRecord: { reason: '' },
        minPaginationPerPage,
        siteKey: process.env.VUE_APP_RECAPTCHA_PUBLIC,
      };
    },
    created() {
      // eslint-disable-next-line camelcase
      const { date_format: dateFormat } = this.settings;
      this.today = moment();
      this.minDate = moment();
      this.maxDate = moment().add(1, 'day');
      this.dateFormat = dateFormat;
      this.$nextTick(this.show);
      this.fetchCountries();
    },
    computed: {
      ...mapGetters('data', ['countries']),
      ...mapGetters('reservations', ['loaded', 'empty', 'iframeLoaded']),
      ...mapGetters('user', ['userID', 'settings', 'propertyID']),
      ...mapState('reservations', ['error', 'pmsError', 'pending', 'data', 'iframe']),

      searchForItems() {
        return [
          { id: 0, text: this.$t('reservations.stayPeriod') },
          { id: 1, text: this.$t('reservations.checkIn') },
          { id: 2, text: this.$t('reservations.checkOut') },
          { id: 3, text: this.$t('reservations.bookingPeriod') },
        ];
      },
      sortedList() {
        return this.data.list.map((i) => {
          const item = { ...i };
          item.rs = item.content.length;
          return item;
        });
      },
      totalItems() {
        return this.data.total;
      },
      cancelTitle() {
        return this.$t(`reservations.title-${this.cancelRecord.noshow ? 'noshow' : 'cancel'}`);
      },
    },
    methods: {
      ...mapActions('data', ['fetchCountries']),
      ...mapActions('reservations', ['fetchData', 'cancelReservation', 'fetchIframe']),

      fromChanged(dt) {
        if (dt.isAfter(this.maxDate, 'date')) {
          this.maxDate = moment(dt);
        }
      },
      untilChanged(dt) {
        if (dt.isBefore(this.minDate, 'date')) {
          this.minDate = moment(dt);
        }
      },
      show() {
        this.fetchData({
          from: this.minDate.format('YYYY-MM-DD'),
          until: this.maxDate.format('YYYY-MM-DD'),
          search: this.searchFor,
          resultPerPage: this.resultPerPage,
          currentPage: this.currentPage,
        });
      },
      updateResultPerPage(resultPerPage) {
        this.resultPerPage = resultPerPage;
        this.show();
      },
      updateCurrentPage(currentPage) {
        this.currentPage = currentPage;
        this.show();
      },
      formatDate(date, time = false, multiline = false) {
        const fdate = this.$t('reservations.checkDate');
        const separator = multiline ? '<br>' : ' ';
        const ftime = time ? `${separator}HH:mm:ss [GMT]` : '';
        return moment.utc(date).format(`${fdate}${ftime}`);
      },
      formatPrice(amount, currency) {
        return formatNumber(amount.toFixed(2).replace('.00', ''), currency.toUpperCase());
      },
      getDays(plan) {
        return moment(plan.till).diff(moment(plan.from), 'days');
      },
      canNoShow(checkin) {
        return moment.utc(checkin).isSameOrBefore(moment.utc());
      },
      guestsCount(guests) {
        const adults = guests.adl > 0 ? this.$tc('reservations.adults', guests.adl) : false;
        const children = guests.cld > 0 ? this.$tc('reservations.children', guests.cld) : false;
        if (adults && children) {
          return this.$t('reservations.both', { adults, children });
        }
        if (adults) return adults;
        if (children) return children;
        return '';
      },
      remarks(record, type) {
        if (!record || !record.remarks) return false;
        const ret = record.remarks[type];
        return Array.isArray(ret) && ret.length ? ret : false;
      },
      profile(record, type) {
        if (!record || !record.profiles) return false;
        let ret = record.profiles[type];
        if (type === 'booker') {
          ret = this.setCountryName(ret);
        } else if (type === 'guests') {
          ret = ret.map((el) => this.setCountryName(el));
        }
        return Array.isArray(ret) && ret.length ? ret : false;
      },
      setCountryName(ret) {
        let index;
        let code;
        ret.forEach((el, i) => {
          const key = el.split(':')[0]?.toLowerCase();
          if (key === 'country name') {
            index = i;
          }
          if (key === 'country code') {
            code = el.split(':')[1]?.toUpperCase();
          }
        });
        const data = [...ret];
        if (code) {
          const country = this.getCountryNameByCode(code.trim());
          data[index] = `Country Name: ${country}`;
        }
        return data;
      },
      getCountryNameByCode(code) {
        const searchedCountry = this.countries.find((country) => country.code === code);
        return searchedCountry ? searchedCountry.name : 'n/a';
      },
      hideNotesPopover(id, suffix = false) {
        const ref = `notes-popover${suffix ? `-${suffix}` : ''}-${id}`;
        this.$refs[ref][0].$emit('close');
      },
      preparePersonModal(row) {
        this.shownRecord = row;
      },
      personModalDidHide() {
        this.shownRecord = {};
      },
      prepareCancelModal(id, noshow = false) {
        this.$refs.cancelForm.reset();
        this.cancelRecord = { id, noshow, reason: '' };
      },
      cancelModalDidHide() {
        this.cancelRecord = { reason: '' };
      },
      async processCancel() {
        const { id, reason, noshow } = this.cancelRecord;
        try {
          await this.cancelReservation({ id, reason, noshow });
        } catch (e) {
          if (e instanceof PMSError) {
            this.$toastr.e(e.message, this.$t('error'));
          }
          // eslint-disable-next-line no-console
          console.error(e.message);
        }
        this.$refs.cancelModal.hide();
      },
      async prepareCreditCardModal(row) {
        try {
          this.$refs.recaptcha.execute();
          await this.fetchIframe({
            bookingId: row.id,
            objectId: this.propertyID,
          });
        } catch (e) {
          if (e instanceof PMSError) {
            this.$toastr.e(e.message, this.$t('error'));
          }
          // eslint-disable-next-line no-console
          console.error(e.message);
        }
      },
    },
  };
</script>
