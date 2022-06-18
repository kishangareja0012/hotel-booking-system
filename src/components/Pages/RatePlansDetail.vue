<template>
  <b-modal
    no-close-on-backdrop
    id="planDetailModal"
    ref="planDetailModal"
    no-fade
    centered
    ok-only
    :ok-title="$t('buttons.close')"
    static
    size="lg"
    modal-class="form-modal plan-detail-modal"
    @hidden="planModalDidHide"
  >
    <template #modal-header-close>
      <icon width="20" height="20" class="d-none d-md-block" type="times"/>
      <icon width="10" height="18" class="d-md-none" type="arrow-left"/>
    </template>
    <ValidationObserver ref="planForm" slim>
      <p class="plan-title">{{ modalDetails.text }}</p>
      <div>
        <div class="columns details-table w-100">
          <table class="desc-table d-block w-100">
            <thead class="d-block w-100">
              <tr class="d-block w-100">
                <td width="270" class="float-left">
                  <th class="w-id align-middle">
                    <div class="lang-choice">
                      {{ $t('rateplans.modalLanguages') }}
                    </div>
                  </th>
                </td>
                <td class="float-left w-68">
                  <lang-selector class="w-100" v-model="lang" :valid="langsValid" ref="modalLangSel" />
                </td>
              </tr>
              <tr class="mt-4 d-inline-block">
                <td width="270">
                  <th>
                    {{ $t('rateplans.modalRatePlanDescription') }}
                  </th>
                </td>
                <td>
                  <p class="w-100 plan-description">
                    {{ modalDetails.desc ? modalDetails.desc : '---' }}
                  </p>
                </td>
              </tr>
              <tr>
                <td width="270">
                  <th>
                    {{ $t('rateplans.modalRoomType') }}
                  </th>
                </td>
                <td v-if="modalDetails.room">
                  {{ modalDetails.room }}
                </td>
              </tr>
            </thead>
          </table>
          <hr>
          <table class="travel-table">
            <thead>
              <tr>
                <td width="270">
                  <th>
                    {{ $t('rateplans.modalTravelDays') }}
                  </th>
                </td>
                <td>
                  <p v-for="key in travelOpts" :key="`tt-${key}`"
                     v-text="key?$t(`rateplans.modalTravelOpts${key}`)
                       + ' : ' + `${modalDetails[key]}`:''"></p>
                </td>
              </tr>
              <tr>
                <td width="270">
                  <th >
                    {{ $t('rateplans.modalLos') }}
                  </th>
                </td>
                <td>
                  {{ modalDetails.minlos + ' - ' + modalDetails.maxlos }}
                  {{ $t('rateplans.updateModalDays') }}
                </td>
              </tr>
              <tr>
                <td width="270">
                  <th >
                    {{ $t('rateplans.headersMealPlan') }}
                  </th>
                </td>
                <td>{{ modalDetails.meals }}</td>
              </tr>
              <tr>
                <td width="270">
                  <th >
                    {{ $t('rateplans.modalCancelPolicies') }}
                  </th>
                </td>
                <td v-if="modalDetails.cancels && modalDetails.cancels.length">
                  <span v-for="(policy, index) in currentPolicies(modalDetails.cancels)"
                        :key="policy.id">{{ policy.text }}
                    <span v-if="index != modalDetails.cancels.length - 1">{{ ', ' }}</span>
                  </span>
                </td>
                <td v-else>
                  {{'---'}}
                </td>
              </tr>
              <tr>
                <td width="270">
                  <th >
                    {{ $t('bgarant') }}
                  </th>
                </td>
                <td>
                  {{ bgarantNameById(modalDetails.bgarant) }}
                </td>
              </tr>
              <tr>
                <td width="270">
                  <th >
                    {{ $t('rateplans.modalPaymentPolicy') }}
                  </th>
                </td>
                <td>
                  <p v-if="modalDetails.policy != 0">
                    {{ paymentPolicyNameById(modalDetails.policy) }}
                  </p>
                  <p v-else>
                    {{'---'}}
                  </p>
                </td>
              </tr>
              <tr>
                <td width="270">
                  <th >
                    {{ $t('rateplans.modalSectionBookable') }}
                  </th>
                </td>
                <td v-if="modalDetails.bookable">
                  <p v-if="modalDetails.bookable.mode===0">
                    {{ bookable.periods.from ? bookable.periods.from : 0 }}
                    {{ $t('rateplans.updateModalDays') }} --
                    {{ bookable.periods.until ? bookable.periods.until : 0 }}
                    {{ $t('rateplans.updateModalDays') }}
                    <br>
                  </p>
                  <p v-else-if="modalDetails.bookable.mode===1">
                    <span v-for="(period, index) in modalDetails.bookable.periods" :key="index">
                      {{ changeDateFormat(period.from) }} --
                      {{ changeDateFormat(period.until)}}
                      <br>
                    </span>
                  </p>
                  <p v-else-if="modalDetails.bookable.mode===2">
                    {{ modalDetails.bookable.from }} {{ $t('rateplans.updateModalDays') }} --
                    {{ modalDetails.bookable.to}} {{ $t('rateplans.updateModalDays') }}
                    {{ $t('rateplans.beforeArrival') }}
                  </p>
                  <p v-else-if="modalDetails.bookable.mode===3">
                    {{ modalDetails.bookable.until}} {{ $t('rateplans.beforeArrival') }}
                  </p>
                  <p v-else>
                    {{ modalDetails.bookable.within}} {{ $t('rateplans.beforeArrival') }}
                  </p>
                </td>
              </tr>
            </thead>
          </table>
          <hr>
          <table class="price-section">
            <thead>
              <tr>
                <td width="270">
                  <th>
                    {{ $t('rateplans.modalPriceOccupancyTwoPerson') }}
                  </th>
                </td>
                <td>
                  <p v-if="modalDetails.price && modalDetails.price.fixed">
                    {{ $t('rateplans.modalFixedPrice')}}
                    {{ modalDetails.price.fixed }} EUR
                  </p>
                  <p v-else>
                    {{'---'}}
                  </p>
                </td>
              </tr>
              <tr>
                <td width="270">
                  <th>
                    <span :style="modalDetails.price && modalDetails.price.fixed ? 'color:#6c757d75' : '' "
                          :disabled="modalDetails.price && modalDetails.price.fixed ? 'disabled' : ''">
                      {{ $t('rateplans.modalStandardPriceMore') }}
                    </span>
                  </th>
                </td>
                <td>
                  <p v-if="modalDetails.price && modalDetails.price.mode==='standard'">
                    {{ modalDetails.price.stdcalc.surcharge.value ?
                      modalDetails.price.stdcalc.surcharge.value :
                      (modalDetails.price.stdcalc.reduction.value
                        ? modalDetails.price.stdcalc.reduction.value : '---') }}
                    <span v-if="modalDetails.price.stdcalc.surcharge.value
                      || modalDetails.price.stdcalc.reduction.value">EUR</span>
                  </p>
                  <p v-else>{{'---'}}</p>
                </td>
              </tr>
              <tr>
                <td width="270">
                  <th>
                    {{ $t('rateplans.modalGuestsOccupancyMore') }}
                  </th>
                </td>
                <td v-if="modalDetails.occupancy">
                  <span>
                    {{ $t('rateplans.modalMinimum') }} {{modalDetails.occupancy.min}},
                    {{ $t('rateplans.modalStandard') }} {{modalDetails.occupancy.std}},
                    {{ $t('rateplans.modalMaximum') }} {{modalDetails.occupancy.max}}
                  </span>
                </td>
                <td v-if="modalDetails.price">
                  <guests-price :std="modalDetails.price.mode==='standard'" :currency="currency.code"
                                :guests="modalDetails.occupancy.std" :price="planFinalPriceModal"/>
                </td>
              </tr>
              <tr>
                <td width="270">
                  <th>
                    {{ $t('rateplans.modal.occupancy-pricing') }}
                  </th>
                </td>
                <td>
                  <span v-if="modalDetails.price && (modalDetails.price.calc.surcharge.value
                    || modalDetails.price.calc.reduction.value)">
                    {{ $t('rateplans.modal.surcharge') }}
                    {{ modalDetails.price.calc.surcharge.value ?
                      '+'+modalDetails.price.calc.surcharge.value+'%' : '---' }}
                    <br>
                    {{ $t('rateplans.modal.reduction') }}
                    {{ '- '+modalDetails.price.calc.reduction.value+' EUR' }}
                  </span>
                  <span v-else> {{'---'}}</span>
                </td>
                <td v-if="modalDetails.occupancy">
                  <guests-price-multiple
                    :currency="currency.code" :occupancy="modalDetails.occupancy" :price="planFinalPriceModal"
                    :surcharge="modalDetails.price.calc.surcharge" :reduction="modalDetails.price.calc.reduction"/>
                </td>
              </tr>
              <tr>
                <td width="270">
                  <th>
                    {{ $t('rateplans.modal.children-bed') }}
                  </th>
                </td>
                <td>
                  <p v-if="modalDetails.price">
                    <span v-for="(child,index) in modalDetails.price.calc.children" :key="index">
                      <p v-if="modalDetails.price.calc.children.age">
                        {{ $t('rateplans.modal.age') }}
                        {{ child.age }}
                        {{ ': +'+child.surcharge.value+'%' }}
                        <br>
                      </p>
                      <p v-else>
                        {{ '---' }}
                        <br>
                      </p>
                    </span>
                  </p>
                </td>
              </tr>
            </thead>
          </table>
          <hr>
          <table class="period-section">
            <thead>
              <tr>
                <td width="270">
                  <th>
                    {{ $t('date.validityPeriod') }}
                  </th>
                </td>
                <td v-if="modalDetails.validity">
                  {{ $t('date.from') }}
                  {{ changeDateFormat(modalDetails.validity.from) }}
                  {{ $t('date.until') }}
                  <span v-if="modalDetails.validity.unlim">
                    {{ $t('date.unlim') }}
                  </span>
                  <span v-else>
                    {{ changeDateFormat(modalDetails.validity.until) }}
                  </span>
                </td>
              </tr>
              <tr>
                <td width="270">
                  <th>
                    <div class="lang-choice">
                      {{ $t('date.blockoutPeriods') }}
                    </div>
                  </th>
                </td>
                <td>
                  <p v-if="modalDetails.blockouts && modalDetails.blockouts.length">
                    <span v-for="(blockout,index) in modalDetails.blockouts" :key="index">
                      {{ changeDateFormat(blockout.from) }} -- {{ changeDateFormat(blockout.until) }}
                      <br>
                    </span>
                  </p>
                  <p v-else>{{'---'}}</p>
                </td>
              </tr>
            </thead>
          </table>
        </div>
      </div>
    </ValidationObserver>
  </b-modal>
</template>

<script>
  import moment from 'moment';
  import {
    mapGetters,
  } from 'vuex';
  import { langCodes, weekdays, bookable } from '@/shared';

  const travelOpts = ['', 'bdays', 'adays', 'ddays'];

  export default {
    name: 'RatePlansDetail',
    props: {
      modalDetails: {
        type: Object,
        default: null,
      },
    },
    data: () => ({
      plan: {},
      lang: 'en',
      detailLangs: {},
      langsValid: [],
      settingsOpened: false,
      priceOpened: false,
      blockoutsOpened: false,
      today: moment(),
      active: 'id',
      filterVal: '',
      filter: '',
    }),
    computed: {
      ...mapGetters('user', ['currency']),
      ...mapGetters('rateplans', ['plans', 'meals', 'cancels', 'bgarants', 'policies']),
      langCodes: () => langCodes,
      weekdays: () => weekdays,
      travelOpts: () => travelOpts,
      travelOptsFiltered: () => travelOpts.filter((key) => !!key),
      bookable: () => bookable,
      planFinalPrice() {
        return this.plan.price.mode === 'standard'
          ? this.plan.price.stdres : this.plan.price.fixed;
      },
      planFinalPriceModal() {
        return this.modalDetails.price.stdcalc.surcharge.value
          ? this.modalDetails.price.stdcalc.surcharge.value : this.modalDetails.price.stdcalc.reduction.value;
      },
      roomSelected() {
        return !!this.plan.room;
      },
      policiesLocalized() {
        const policy = [
          {
            name: 'No payment policy',
            desc: '',
          },
        ];
        return [
          {
            id: '0',
            policy,
          },
          ...this.policies,
        ];
      },
    },
    methods: {
      disabledForPromo(price = false) {
        return this.plan.promo != null && (!price || this.plan.promomode === 'promo');
      },
      modalScroll(ev) {
        const modal = ev.target;
        this.$nextTick(() => {
          if (modal != null) modal.scrollTop = 0;
        });
      },
      bgarantNameById(id) {
        return this.bgarants.find((bgarant) => bgarant.id === id)?.title;
      },
      paymentPolicyNameById(id) {
        return this.policies.find((policie) => policie.id === id)?.name;
      },
      currentPolicies(ids) {
        return this.cancels
          .filter(({ id }) => ids.includes(id))
          .map(({ langs, id }) => ({ id, text: langs.en.name }));
      },
      planModalDidHide() {
        // this.modalDetails = {};
      },
      changeDateFormat(date) {
        return moment(String(date)).format('DD MMM YYYY');
      },
    },
  };
</script>
