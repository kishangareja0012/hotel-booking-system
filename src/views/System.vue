<template>
  <div class="page-system">
    <div>
      <div class="panel-title position-relative w-100 title">
        <p>{{ systemName }}</p>
      </div>
      <div class="row">
        <b-modal
          no-close-on-backdrop
          id="updateModal"
          ref="updateModal"
          no-fade
          top
          static
          size="lg"
          modal-class="form-modal"
          focus-selector="#PropertyKey"
          :ok-title="$t('buttons.save')"
          ok-variant="primary"
          :cancel-title="$t('buttons.cancel')"
          cancel-variant="outline-primary"
          :cancel-disabled="updatePending"
          :no-close-on-esc="updatePending"
          :hide-header-close="updatePending"
          :ok-disabled="updatePending || !$refs.PropertyKeyForm || formInvalid"
          @ok.prevent="processForm"
        >
          <template #modal-header-close>
            <icon width="20" height="20" class="d-none d-md-block" type="times"/>
            <icon width="10" height="18" class="d-md-none" type="arrow-left"/>
          </template>
          <template #modal-title>
            {{ $t('systems.modalChangeSettings') }}
          </template>
          <ValidationObserver ref="PropertyKeyForm" slim>
            <div class="row PropertyKeyModalRow">
              <div class="col-md-12 col-sm-12" v-if="id === this.apaleoId">
                <label class="text-xs" for="PropertyKey">{{ $t('systems.modalPropertyKey') }}</label>
                <ValidatedField
                  type="text" id="PropertyKey" name="PropertyKey" class="mb-0 property-id"
                  v-model="property" :disabled="updatePending"
                  :placeholder="$t('systems.modalPropertyKeyPlaceholder')"
                  :rules="rulesFor('PropertyKey')"
                />
              </div>
              <div class="col-md-12 col-sm-12" v-if="id == this.hostawayId">
                <label class="text-xs" for="hostawayAccountID">{{ $t('systems.modalAccountId') }}</label>
                <ValidatedField
                  type="text" id="hostawayAccountID" name="hostawayAccountID" class="mb-4 property-id"
                  v-model="hostawayAccountID"
                  :disabled="updatePending" :placeholder="$t('systems.modalAccountIdPlaceholder')"
                  :rules="rulesFor('hostawayAccountID')"
                />
              </div>
              <div class="col-md-12 col-sm-12" v-if="id == this.hostawayId">
                <label class="text-xs" for="hostawayAPIKey">{{ $t('systems.modalApiKey') }}</label>
                <ValidatedField
                  type="text" id="hostawayAPIKey" name="hostawayAPIKey" class="mb-0 property-id"
                  v-model="hostawayAPIKey" :disabled="updatePending"
                  :placeholder="$t('systems.modalApiKeyPlaceholder')"
                  :rules="rulesFor('hostawayAPIKey')"
                />
              </div>
            </div>
          </ValidationObserver>
        </b-modal>
        <div class="col-6">
          <div class="row" v-if="id == apaleoId">
            <div class="col cell-field">{{ $t('systems.modalPropertyKey') }}</div>
            <div class="col cell-value">{{ this.propertyKey }}</div>
          </div>
          <div class="row" v-if="id == hostawayId">
            <div class="col cell-field">{{ $t('systems.modalAccountId') }}</div>
            <div class="col cell-value">{{ this.accountId }}</div>
          </div>
          <div class="row">
            <div class="col cell-change-settings">
              <b-btn variant="outline-primary" @click="openUpdateModal">
                {{ $t('systems.connectBtnChangeSettings') }}
              </b-btn>
            </div>
          </div>
        </div>
      </div>
      <floater :shown="hasPullChanges" no-content>
        <template #footer>
          <span class="connections-count">
            {{ $tc('systems.connectSelectedChangesCount', pullChangesCount) }}
          </span>
          <b-btn pill variant="outline-primary" size="sm" :disabled="updatePending"
                 @click="connectPlan">{{ $t('buttons.update') }}</b-btn>
        </template>
      </floater>
      <tabs :items="tabs" v-model="tab" with-content v-if="loaded">
        <template #tab(pending)>
          <div class="pending-table" v-if="loaded">
            <div class="dst-list">
              <p class="headline">{{ systemName }}</p>
              <div class="rates-list">
                <div class="type-item" v-if="id == apaleoId">
                  <div class="type-item" v-for="(plan, key) in ratePlan"
                       :key="`stype-${key}`">
                    <h6 :class="{ opened: isOpen(key) }" @click="toggleOpen(key)">
                      {{ key }}
                      <icon width="13" height="7" stroke-width="2" type="arrow-down" class="icon-open"/>
                      <icon width="13" height="7" stroke-width="2" type="arrow-up" class="icon-close"/>
                    </h6>
                    <div>
                      <p v-for="p in plan" :key="`splan-${p.id}`"
                         @click="setSRate(p.id)" :class="{ active: isActiveSRate(p.id) }">
                        <icon width="20" height="20" type="link" />
                        {{ p.name }} - {{ p.code }} ({{ p.id }})
                      </p>
                    </div>
                  </div>
                </div>
                <div class="type-item" v-if="id == hostawayId">
                  <div>
                    <p v-for="(plan) in ratePlan" :key="`splan-${plan.id}`"
                       @click="setSRate(plan.id)" :class="{ active: isActiveSRate(plan.id) }">
                      <icon width="20" height="20" type="link" />
                      {{ plan.name }} - ({{ plan.id }})
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div class="src-list" :class="{ 'd-none': seluniq == null }">
              <p class="headline">{{ $t('systems.connectMyRatePlans') }}</p>
              <div class="rates-list">
                <div class="type-item" v-for="(product, key) in cultProduct" :key="`type-${key}`">
                  <h6 :class="{ opened: isOpen(key) }" @click="toggleOpen(key)">
                    {{ key }} ({{product[0].room}})
                    <icon width="13" height="7" stroke-width="2" type="arrow-down" class="icon-open"/>
                    <icon width="13" height="7" stroke-width="2" type="arrow-up" class="icon-close"/>
                  </h6>
                  <div>
                    <p v-for="p in product" :key="`plan-${p.id}`"
                       @click="linkPlan(p)">
                      <icon width="20" height="20" type="link"/>{{ p.text }} ({{ p.id }})
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
        <template #tab(connected)>
          <div class="mapped-table" v-if="loaded">
            <div class="mapped-heading">
              <p class="headline">{{ systemName }}</p>
              <p class="separator"></p>
              <p class="headline">{{ $t('systems.connectMyRatePlans') }}</p>
            </div>
            <table class="w-100">
              <tbody v-for="(item, index) in connected" :key="`mapped-${index}`">
                <tr>
                  <td class="cell-dst" v-if="id == apaleoId">
                    <p class="room"><b>{{ $t('systems.connectMappedRoom') }}:&nbsp;</b>
                      {{ item.plan.unitGroup.id }}</p>
                    <p><b>{{ $t('systems.connectMappedPlan') }}:&nbsp;</b>
                      {{ item.plan.name }} - {{ item.plan.code }} ({{ item.plan.id }})</p>
                  </td>
                  <td class="cell-dst" v-if="id == hostawayId">
                    <p class="room"><b>{{ $t('systems.connectMappedRoom') }}:&nbsp;</b>
                      {{ item.plan.name }} ({{ item.plan.id }})</p>
                  </td>
                  <td class="cell-src">
                    <p class="room"><b>{{ $t('systems.connectMappedRoom') }}:&nbsp;</b>
                      {{ item.product.roomType }} ({{ item.product.room }})</p>
                    <p><b>{{ $t('systems.connectMappedPlan') }}:&nbsp;</b></p>
                    <p>{{ item.product.text }} ({{ item.product.id }})</p>
                  </td>
                  <td class="cell-action">
                    <b-btn pill variant="danger" size="sm"
                           @click="disconnectPlan(index)" :disabled="updatePending"
                    >{{ $t('systems.connectBtnDisconnect') }}</b-btn>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </tabs>
    </div>
  </div>
</template>

<script>
  import {
    mapActions, mapGetters, mapState, mapMutations,
  } from 'vuex';
  import { HttpError, PMSError } from '@/errors';
  import { systemList } from '@/shared';

  export default {
    name: 'System',
    data: () => ({
      cmap: {
        selected: [],
        open: [],
        pselected: [],
      },
      id: null,
      tab: null, // 'connected',

      seluniq: null,
      system: '',
      property: '',
      account: '',
      ratePlan: [],
      cultProduct: [],
      apaleoId: systemList.apaleo.id,
      hostawayId: systemList.hostaway.id,
      hostawayAccountID: '',
      hostawayAPIKey: '',
    }),
    mounted() {
      this.setSystemId(this.$route.params.id);
      if (systemList.apaleo.id === Number(this.$route.params.id)) {
        this.getObjectMap();
      }
    },
    watch: {
      $route() {
        this.setSystemId(this.$route.params.id);
      },
      plans() {
        if (systemList.apaleo.id === Number(this.$route.params.id)) {
          this.ratePlan = this.groupByProperty(this.plans, 'unitGroup', 'id');
        } else if (systemList.hostaway.id === Number(this.$route.params.id)) {
          this.ratePlan = this.plans;
        }
      },
      cultuzzProduct() {
        if (this.cultuzzProduct?.length > 0) {
          this.cultProduct = this.groupByProperty(this.cultuzzProduct, 'roomType');
        }
      },
      propertyKey() {
        if (this.propertyKey) this.property = this.propertyKey;
      },
      accountId() {
        if (this.accountId) this.hostawayAccountID = this.accountId;
      },
      systemName() {
        return this.system;
      },
      connected() {
      },
    },

    computed: {
      ...mapGetters('system', ['loaded', 'cultuzzProduct', 'plans', 'connected', 'propertyKey', 'accountId']),
      ...mapState('system', ['error', 'pending', 'updatePending', 'updateError', 'clientSecretValid']),
      ...mapGetters('user', ['propertyID']),

      tabs() {
        const tabs = [
          { id: 'pending', title: this.$t('systems.connectTabPending') },
          { id: 'connected', title: this.$t('systems.connectTabConnected') },
        ];
        return tabs;
      },
      hasPullChanges() {
        return this.pullChangesCount > 0;
      },
      pullChangesCount() {
        return this.cmap.selected.length;
      },
      formInvalid() {
        return this.$refs.PropertyKeyForm && this.$refs.PropertyKeyForm.flags.invalid;
      },
      systemName() {
        return this.system;
      },
    },
    methods: {
      ...mapActions('system', [
        'fetchData', 'connectRatePlans', 'disconnectRatePlan',
        'updateChannelData', 'updatePlanConnection',
        'createContract', 'updateContract', 'deleteContract', 'setPropertyKey', 'getObjectMap', 'setCurrentSystemId',
        'hostawaySetClientSecret', 'getConnectedAccountId',
      ]),
      ...mapMutations('system', ['clearErrors', 'updateMapped', 'toConnected']),

      async setSystemId(id) {
        this.id = id;
        if (Number(id) === systemList.apaleo.id) {
          this.system = systemList.apaleo.name;
        } else if (Number(id) === systemList.hostaway.id) {
          this.system = systemList.hostaway.name;
          await this.getConnectedAccountId();
        }
        try {
          this.setCurrentSystemId(this.id);
          await this.fetchData({ force: true });
        } catch (e) {
          if (e instanceof HttpError && e.errorCode === 400) {
            await this.$router.replace({ name: 'systems' });
            return;
          }
        }
        this.freshData();
      },
      freshData() {
        this.tab = 'pending';
      },
      isActiveSRate(uniq) {
        return this.seluniq === uniq;
      },
      setSRate(uniq) {
        if (this.updatePending) return;
        if (this.isActiveSRate(uniq)) {
          this.seluniq = null;
        } else {
          this.seluniq = uniq;
        }
      },
      linkPlan(product) {
        if (this.updatePending) return;
        const uniq = this.seluniq;
        const plan = this.plans.find((rate) => rate.id === uniq);
        this.cmap.selected.push({
          product,
          plan,
        });
        this.seluniq = null;
        this.updateMapped({ selected: this.cmap.selected });
      },
      unlinkPlan(uniq) {
        const idx = this.cmap.selected.findIndex((plan) => plan.uniq === uniq);
        if (idx !== -1) {
          this.cmap.selected.splice(idx, 1);
        }
      },
      async updateChannel({ id, values }) {
        try {
          await this.updateChannelData({ id, payload: values });
          this.$toastr.s({
            title: this.$t('systems.alertSaved'),
            msg: '',
            timeout: 3000,
            progressbar: false,
          });
          if (!this.invalid) {
            this.freshData();
          }
          this.$refs.updateModal.hide();
        } catch (err) {
          if (err instanceof PMSError) {
            this.$toastr.e(err.message, this.$t('error'));
          }
        }
      },
      async disconnectPlan(index) {
        // console.log(index);
        try {
          await this.disconnectRatePlan({ index, propertyId: this.propertyKey });
          this.$toastr.s({
            title: this.$t('systems.connectAlertDisconnected'),
            msg: '',
            timeout: 3000,
            progressbar: false,
          });
        } catch (e) {
          if (e instanceof PMSError) {
            this.$toastr.e(e.message, this.$t('error'));
          }
          // eslint-disable-next-line no-console
          console.error(e.message);
        }
      },
      async connectPlan() {
        this.toConnected({ selected: this.cmap.selected });
        try {
          await this.connectRatePlans({ propertyId: this.propertyKey });
          this.cmap.selected = [];
          this.$toastr.s({
            title: this.$t('channels.connect.alert-updated'),
            msg: '',
            timeout: 3000,
            progressbar: false,
          });
        } catch (e) {
          if (e instanceof PMSError) {
            this.$toastr.e(e.message, this.$t('error'));
          }
          // eslint-disable-next-line no-console
          console.error(e.message);
        }
      },
      isOpen(id) {
        return this.cmap.open.indexOf(id) === -1;
      },
      toggleOpen(id) {
        const idx = this.cmap.open.indexOf(id);
        if (idx !== -1) {
          this.cmap.open.splice(idx, 1);
        } else {
          this.cmap.open.push(id);
        }
      },
      openUpdateModal() {
        this.$refs.updateModal.show(this.property);
      },
      rulesFor() {
        const rules = {
          required: true,
        };
        return rules;
      },
      async processForm() {
        try {
          if (this.id === this.apaleoId) {
            this.setPropertyKey(this.property);
          }
          if (Number(this.id) === Number(this.hostawayId)) {
            await this.hostawaySetClientSecret(
              { hostawayAccountID: this.hostawayAccountID, hostawayAPIKey: this.hostawayAPIKey },
            );
          }
          if (this.clientSecretValid) {
            this.$nextTick(() => {
              this.$refs.updateModal.hide();
              this.fetchData({ force: true });
            });
          } else if (!this.clientSecretValid && this.id === this.hostawayId) {
            this.$toastr.e('Invalid Hostaway credential', 'Error');
          }
        } catch (error) {
          this.$toastr.e(error.message, 'Error');
        }
      },
      groupByProperty(objectArray, property, nestedProperty = null) {
        return objectArray.reduce((acc, obj) => {
          const key = nestedProperty != null ? obj[property][nestedProperty] : obj[property];
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(obj);
          return acc;
        }, {});
      },
    },
  };
</script>
