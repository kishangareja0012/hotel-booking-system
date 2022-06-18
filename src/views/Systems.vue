<template>
  <div class="page-systems">
    <b-modal
      no-close-on-backdrop
      id="ActivateSystemModal"
      ref="ActivateSystemModal"
      no-fade
      top
      static
      size="lg"
      modal-class="form-modal"
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
        {{$t('systems.modalActivate')}}
      </template>
      <ValidationObserver ref="PropertyKeyForm">
        <div class="row apaleoPropertyKeyModalRow">
          <div class="col-md-12 col-sm-12" v-if="currentSystemId === this.apaleoId">
            <label class="text-xs" for="apaleoHotelKey">{{ $t('systems.modalHotelKey') }}</label>
            <ValidatedField
              type="text" id="apaleoHotelKey" name="apaleoHotelKey" class="mb-0 hotel-id"
              v-model="apaleoHotelKey" :disabled="updatePending"
              :placeholder="$t('systems.modalHotelKeyPlaceholder')"
              :rules="rulesFor('apaleoHotelKey')"
            />
          </div>
          <div class="col-md-12 col-sm-12" v-if="currentSystemId == this.hostawayId">
            <label class="text-xs" for="hostawayAccountID">{{ $t('systems.modalAccountId') }}</label>
            <ValidatedField
              type="text" id="hostawayAccountID" name="hostawayAccountID" class="mb-4 property-id"
              v-model="hostawayAccountID"
              :disabled="updatePending" :placeholder="$t('systems.modalAccountIdPlaceholder')"
              :rules="rulesFor('hostawayAccountID')"
            />
          </div>
          <div class="col-md-12 col-sm-12" v-if="currentSystemId == this.hostawayId">
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
    <div>
      <div class="panel-title position-relative w-100 title">
        <p>{{ $t('systems.titleFull') }}</p>
      </div>
      <div class="panel-subtitle position-relative-w-100 title">
        <p>{{ $t('systems.titleSub') }}</p>
      </div>

      <tabs :items="tabs" v-model="activeTab" with-content v-if="loaded">
        <template #tab(connected-pms)>
          <div class="list connected-pms">
            <div class="tablist-none" v-if="!connectedSystems.length">
              {{  $t('systems.noConnected') }}
            </div>
            <div class="plans-table" v-else>
              <table class="w-100">
                <thead>
                  <tr>
                    <th class="w-name">
                      {{ $t('systems.headersName') }}
                    </th>
                    <th class="w-version">
                      {{ $t('systems.headersVersion') }}
                    </th>
                    <th class="w-mapping">
                      {{ $t('systems.headersConnection') }}
                    </th>
                    <th class="w-actions">
                      <span v-b-tooltip.hover.topleft="{ customClass: 'info-connection-tooltip' }"
                            :title="$t('systems.connectionTooltip')">
                        <icon width="20" height="20" type="alert-info" color="#F7981C" />
                      </span>
                      {{ $t('systems.headersActions') }}
                    </th>
                  </tr>
                </thead>

                <tbody v-for="(row, idx) in filteredConnectedSystems" :key="row.id">
                  <tr class="separator before"></tr>
                  <tr>
                    <td class="cell-name">
                      <a v-if="row.url" :href="row.url" target="_blank" class="pms-link">
                        <span :title="row.description">{{ row.name }}</span>
                        <icon type="new-window" width="12" height="14" color="#5A5C6C"/>
                      </a>
                      <span v-else>{{ row.name }}</span>
                    </td>
                    <td class="cell-versions">
                      <div class="d-inline-block">
                        <spinner v-if="updatePending" />
                        <fragment v-else>
                          <b-dropdown size="sm" toggle-tag="span" variant="link" no-caret left
                                      :disabled="!row.enabled">
                            <template #button-content>
                              {{ composeVersion(row.active, idx) }}
                              <icon width="18" height="18" type="expand"/>
                            </template>
                            <b-dropdown-item v-for="s in row.software" :key="s.id"
                                             :active="row.active === s.id">
                              <radio reversed
                                     :value="row.active"
                                     name="version-radios"
                                     :val="s.id"
                                     @click.native.capture.stop="changeState(row, s.id)"
                              >{{ composeVersion(s.id, idx) }}
                              </radio>
                            </b-dropdown-item>
                          </b-dropdown>
                        </fragment>
                      </div>
                    </td>
                    <td class="cell-actions">
                      <div class="d-inline-block text-left mb-1" v-if="row.id == apaleoId">
                        <spinner v-if="updatePending" />
                        <b-btn variant="primary"
                               pill block
                               :href="authUrl"
                               v-if="connection == 'no'"
                               :disabled="updatePending"
                               target="_blank"
                        >
                          <span>
                            {{ $t('systems.buttonConnect') }}
                          </span>
                        </b-btn>
                      </div>
                      <div class="d-inline-block text-left">
                        <b-btn variant="primary"
                               pill block
                               @click="openActivateModal(row.id)"
                               v-if="connection == 'yes' && row.id == apaleoId"
                               :disabled="updatePending"
                        >
                          <span>
                            {{ $t('systems.buttonMapping') }}
                          </span>
                        </b-btn>
                        <b-btn variant="primary"
                               pill block
                               @click="openActivateModal(row.id)"
                               v-if="row.id == hostawayId"
                               :disabled="updatePending"
                        >
                          <span>
                            {{ $t('systems.buttonMapping') }}
                          </span>
                        </b-btn>
                      </div>
                    </td>
                    <td class="cell-actions">
                      <div class="d-inline-block">
                        <spinner v-if="updatePending" />
                        <fragment v-else>
                          <span class="status" :class="`status-${!!row.active ? 'active' : 'inactive'}`">
                            <b-dropdown size="sm" toggle-tag="span" variant="link" no-caret right
                                        :disabled="!row.enabled">
                              <template #button-content>
                                {{ statusText(!!row.active ? 'active' : 'inactive') }}
                                <icon v-if="row.enabled" width="18" height="18" type="expand"/>
                              </template>
                              <b-dropdown-item
                                v-if="!row.active"
                                class="do-activate" @click="changeState(row)"
                                :disabled="updatePending"
                              >{{ $t('systems.buttonActivate') }}</b-dropdown-item>
                              <b-dropdown-item
                                v-if="!!row.active"
                                class="do-deactivate" @click="changeState()"
                                :disabled="updatePending"
                              >{{ $t('systems.buttonDeactivate') }}</b-dropdown-item>
                            </b-dropdown>
                          </span>
                          <span class="status-date">{{ formatDate(row) }}</span>
                        </fragment>
                      </div>
                    </td>
                  </tr>
                  <tr class="separator after"></tr>
                </tbody>
              </table>
            </div>
          </div>
        </template>
        <template #tab(available-pms)>
          <div class="list available-pms">
            <div class="d-flex justify-content-end">
              <search-filter v-model="filterAvailable" :disabled="!loaded || updatePending"
                             :placeholder="$t('systems.filterTip')"/>
            </div>
            <div class="tablist-none" v-if="!availableSystems.length">
              {{  $t('systems.noAvailable') }}
            </div>
            <div class="plans-table" v-else>
              <table class="w-100">
                <thead>
                  <tr>
                    <th class="w-name">
                      {{ $t('systems.headersName') }}
                      <sort-indicator v-if="availableSystems.length > 1" v-model="sort" field="name" />
                    </th>
                    <th class="w-actions">
                      {{ $t('systems.headersActions') }}
                    </th>
                  </tr>
                </thead>

                <tbody v-if="filterAvailable && !availableSystems.length">
                  <tr>
                    <td colspan="2" class="w-empty">{{ $t('systems.filterNone') }}</td>
                  </tr>
                </tbody>

                <tbody v-for="row in filteredAvailableSystems" :key="row.id">
                  <tr class="separator before"></tr>
                  <tr>
                    <td class="cell-name">
                      <a v-if="row.url" :href="row.url" target="_blank" class="pms-link">
                        <span>{{ row.name }}</span>
                        <icon type="new-window" width="12" height="14" color="#5A5C6C"/>
                      </a>
                      <span v-else>{{ row.name }}</span>
                    </td>
                    <td class="cell-actions available">
                      <div class="d-inline-block text-left">
                        <b-btn variant="primary"
                               pill block
                               :disabled="updatePending || !row.enabled"
                               @click="changeState(row)"
                        >
                          <spinner v-if="updatePending"/>
                          <span v-else>
                            {{ $t('systems.buttonActivate') }}
                          </span>
                        </b-btn>
                      </div>
                    </td>
                  </tr>
                  <tr class="separator after"></tr>
                </tbody>
              </table>
            </div>
          </div>
        </template>
      </tabs>
    </div>
  </div>
</template>

<script>
  import {
    mapState, mapGetters, mapActions,
  } from 'vuex';
  import { PMSError, ValidationError } from '@/errors';
  import moment from 'moment';
  import { systemList } from '@/shared';

  export default {
    name: 'Systems',
    data: (vm) => ({
      sort: '+id',
      tabs: [
        { id: 'connected-pms', title: vm.$t('systems.tabsConnectedPms') },
        { id: 'available-pms', title: vm.$t('systems.tabsAvailablePms') },
      ],
      activeTab: 'connected-pms',
      filterAvailable: '',
      filterConnected: '',
      apaleoPropertyKey: '',
      currentSystemId: '',
      hostawayAccountID: '',
      hostawayAPIKey: '',
      apaleoId: systemList.apaleo.id,
      hostawayId: systemList.hostaway.id,
    }),
    created() {
      this.fetchData();
    },
    computed: {
      ...mapGetters('systems', ['loaded', 'systems', 'connection']),
      ...mapState('systems', ['error', 'updatePending', 'authUrl', 'clientSecretValid']),

      connectedSystems() {
        const connectedSystems = this.systems.filter((sys) => sys && sys?.active) || [];
        const isApaleo = connectedSystems.some((el) => el.id === this.apaleoId);
        if (isApaleo) {
          this.checkConnection();
        }
        return connectedSystems;
      },
      availableSystems() {
        return this.systems.filter((sys) => sys && !sys?.active && sys?.enabled) || [];
      },
      filteredConnectedSystems() {
        return this.filterSystems(this.connectedSystems, this.filterConnected);
      },
      filteredAvailableSystems() {
        return this.filterSystems(this.availableSystems, this.filterAvailable);
      },
      formInvalid() {
        return this.$refs.PropertyKeyForm && this.$refs.PropertyKeyForm.flags.invalid;
      },
    },
    methods: {
      ...mapActions('systems', ['fetchData', 'systemState', 'validationError', 'apaleoObjectMap', 'setapaleoPropertyKey', 'checkConnection', 'hostawaySetClientSecret']),

      formatDate(row) {
        return row.dt && row.enabled ? moment(row.dt).format('D MMM YYYY') : '';
      },
      composeVersion(id, idx) {
        const selectedSoftware = this.connectedSystems[idx].software.find((s) => s.id === id);
        return `
          ${selectedSoftware.name}
          (${this.getCertification(selectedSoftware.certificate)})
          ID: ${id}
        `;
      },
      filterSystems(systems, filterStr) {
        const filter = filterStr.trim().toLowerCase();
        let ret = [...systems];
        if (filter) {
          ret = ret.filter(({ id, name }) => (`${id}`.includes(filter) || name.toLowerCase().includes(filter)));
        }
        const k = this.sort.charAt(0) === '+' ? 1 : -1;
        ret = ret.sort((a, b) => {
          const v1 = a.name.trim().toLowerCase();
          const v2 = b.name.trim().toLowerCase();
          // eslint-disable-next-line no-nested-ternary
          return k * (v1 > v2 ? 1 : (v1 < v2 ? -1 : 0));
        });
        return ret;
      },
      getCertification(code) {
        let certification = null;
        switch (code) {
          case 1:
            certification = this.$t('systems.certificateAvailability');
            break;
          case 2:
            certification = this.$t('systems.certificateAvailabilityRates');
            break;
          case 3:
            certification = this.$t('systems.certificateAvailabilityRatesConditions');
            break;
          default:
            certification = '';
        }
        return certification;
      },
      statusText(status) {
        return this.$t(`systems.${status}`);
      },
      changeState(row = null, softwareID = null) {
        let software = softwareID;

        if (!softwareID && row) {
          software = row.software[0].id;
        }

        try {
          this.systemState({ system: row?.id, software });
        } catch (err) {
          if (err instanceof ValidationError || err instanceof PMSError) {
            this.$toastr.e(err.message, this.$t('error'));
          }
        }
      },
      openActivateModal(systemId) {
        this.currentSystemId = systemId;
        this.$nextTick(this.$refs.ActivateSystemModal.show);
      },
      rulesFor() {
        const rules = {
          required: true,
        };
        return rules;
      },
      openZammadForm() {
        const formButton = document.getElementById('feedback-form');
        formButton.click();
      },
      async processForm() {
        try {
          if (this.currentSystemId === this.apaleoId) {
            this.setapaleoPropertyKey(this.apaleoPropertyKey);
            await this.apaleoObjectMap();
            this.$router.push({ name: 'system', params: { id: this.currentSystemId } });
          } else if (this.currentSystemId === this.hostawayId) {
            await this.hostawaySetClientSecret(
              { hostawayAccountID: this.hostawayAccountID, hostawayAPIKey: this.hostawayAPIKey },
            );
          }
          if (this.clientSecretValid) {
            this.$nextTick(() => {
              this.$refs.ActivateSystemModal.hide();
              this.$router.push({ name: 'system', params: { id: this.currentSystemId } });
            });
          } else if (!this.clientSecretValid && this.currentSystemId === this.hostawayId) {
            this.$toastr.e('Invalid Hostaway credential', 'Error');
          }
        } catch (error) {
          this.$toastr.e(error.message, 'Error');
        }
      },
    },
  };
</script>
