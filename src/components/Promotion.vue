<template>
  <div class="promo-block" :class="{ padded: type === 'channel' }">
    <div class="promo-header">
      <div class="promo-header-filters">
        <search-filter
          :value="filter"
          @input="$emit('filter', $event)"
          autofocus
          :placeholder="$t('channels.promoSearch')"
          :disabled="updating"
        />
        <check-box :value="all" :disabled="updating" @input="$emit('all', $event)">
          {{ $t("channels.promoAllPromos") }}
        </check-box>
      </div>
      <b-btn variant="secondary" pill @click="openCreatePromo()" :disabled="updating">
        <icon type="plus" w="10" h="10" />
        {{ $t(`channels.promoButtonAdd${mode}`) }}
      </b-btn>
    </div>
    <table class="w-100">
      <thead>
        <tr>
          <th class="w-name">{{ $t(`channels.promoHeaders${mode}`) }}</th>
          <th v-if="mode === 'promo'" class="w-discount">{{ $t("channels.promoHeadersDiscount") }}</th>
          <th class="w-plans">{{ $t("channels.promoHeadersPlans") }}</th>
          <th class="w-validity">{{ $t("channels.promoHeadersValidity") }}</th>
          <th class="w-actions">{{ $t("commonKeys.actions") }}</th>
        </tr>
      </thead>
      <tbody v-if="!promos.length">
        <tr>
          <td colspan="5" class="w-empty">
            {{ $t(`channels.promo${filter ? "FilterNoCodes" : "NoCodes"}${mode}`) }}
          </td>
        </tr>
      </tbody>
      <tbody v-for="promo in promos" :key="`${mode}-${promo.id}`">
        <tr class="separator before"></tr>
        <tr>
          <td>
            {{ promo.name }}
            <b-badge variant="primary" class="ml-1">{{ promo.code }}</b-badge>
          </td>
          <td v-if="mode === 'promo'">{{ promoDiscount(promo, true) }}</td>
          <td>
            <div
              v-for="({ id, text, rid, rtext }, idx) in promoRates(promo)"
              :key="`${mode === 'promo' ? 'pr' : 'cr'}-${promo.code}-${idx}`"
            >
              {{ rtext }} ({{ rid }}) &centerdot; {{ text }} ({{ id }})
            </div>
          </td>
          <td>
            <p>{{ formatDate(promo, "from", false) }} ~ {{ formatDate(promo, "until", false) }}</p>
          </td>
          <td class="actions">
            <b-btn v-if="!promo.outdated" class="btn-icon btn-tiny" @click="editPromo(promo)" :disabled="updating">
              <icon width="17" height="17" type="edit" />
            </b-btn>
            <b-btn v-else class="btn-icon btn-tiny" @click="editPromo(promo)" :disabled="updating">
              <icon width="20" height="17" type="visible" />
            </b-btn>
            <b-btn class="btn-icon btn-tiny" @click="deletePromo(promo)" :disabled="updating">
              <icon width="19" height="19" type="delete" />
            </b-btn>
          </td>
        </tr>
        <tr class="separator after"></tr>
      </tbody>
    </table>
  </div>
</template>

<script>
  import moment from 'moment';
  import { mapGetters } from 'vuex';
  import { currencySymbols } from '@/shared';

  export default {
    name: 'Promotion',
    props: {
      type: {
        type: String,
        required: true,
      },
      mode: {
        type: String,
        required: true,
      },
      filter: {
        required: false,
      },
      updating: {
        type: Boolean,
        default: false,
      },
      all: {
        type: Boolean,
        required: true,
      },
      promos: {
        type: Array,
      },
    },
    computed: {
      ...mapGetters('channel', ['rooms', 'plans', 'contractPlans', 'contractRooms']),
      ...mapGetters('user', ['currency']),
    },
    methods: {
      formatDate(row, field = 'dt', emptyField = 'enabled') {
        return row[field] && (!emptyField || row[emptyField]) ? moment(row[field]).format('D MMM YYYY') : '';
      },
      promoDiscount(contract, addsign = false) {
        const rate = this.contractPlans.find(({ promo }) => promo === contract.code);
        if (rate == null) return addsign ? '—' : {};
        const d = { ...rate.price.stdcalc.reduction };
        if (!addsign) return d;
        const { value, mode } = d;
        return `${value}${mode === 'percent' ? '%' : currencySymbols[this.currency]}`;
      },
      promoRates(contract) {
        return this.contractPlans
          .filter(({ promo }) => promo === contract.code)
          .map(({ id, text, room }) => {
            const { id: rid, text: rtext } = this.contractRooms.find(({ pid }) => pid === room);
            return {
              id,
              text,
              rid,
              rtext,
            };
          });
      },
      editPromo(promo) {
        // this.resetPromoForm(contract.mode, false);
        this.$emit('edit', promo);
      },
      deletePromo(promo) {
        this.$emit('delete', promo);
      },
      openCreatePromo() {
        this.$emit('create');
      },
    },
  };
</script>
