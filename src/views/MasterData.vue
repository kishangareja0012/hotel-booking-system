<template>
  <div class="page-masterdata">
    <div class="">
      <div ref="title" class="panel-title position-relative w-100 title">
        <p>{{ $t('masterData.title') }}</p>
      </div>
      <b-alert v-if="pmsError" variant="danger" show>
        <h4 class="alert-heading">{{ $t('error') }}</h4>
        <p class="mb-0">{{ pmsError.response ? pmsError.response.data.message : pmsError }}</p>
      </b-alert>
      <div v-else id="tabs">
        <div class="tabs" @click="initProperty">
          <a v-for="(tab, idx) in tabs" :key="`tab-${idx}`" @click="setTab(idx)"
             :class="{ active: activetab === idx }">
            {{ $t(tab) }}
          </a>
        </div>
        <div class="">
          <div v-show="activetab === 0" class="tab-content">
            <ValidationObserver ref="form0">
              <form @submit.prevent="onSubmit">
                <div class="row">
                  <div class="col-12">
                    <ImageSelector v-model="logo" />
                  </div>
                </div>
                <div class="row">
                  <p class="col-12 head-line">
                    {{ $t('masterData.propertyName') }}<span class="required">*</span>
                  </p>
                </div>
                <div class="row">
                  <div class="col-md-6 col-sm">
                    <ValidatedField rules="required_string|max:100" :disabled="pending"
                                    type="text" name="name" :placeholder="$t('masterData.propertyName')"
                                    v-model="property.name"
                    />
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-6 col-sm input-padding-left">
                    <p class="head-line">{{ $t('masterData.propertyType') }}</p>
                    <drop-down
                      id="type"
                      id-key="id"
                      label-key="name"
                      rules="required"
                      :items="allTypes"
                      :disabled="pending"
                      v-model="propertyValues.type"
                    />
                  </div>
                </div>
                <div class="row">
                  <p class="col-12 head-line">{{ $t('masterData.capacity') }}<span class="required">*</span></p>
                </div>
                <div class="row">
                  <div class="col-md-2 col-sm  input-padding-right capacity">
                    <ValidatedField rules="required|between:1,9999" :disabled="pending" autocomplete="no"
                                    type="number" name="capacity" min="1" max="9999"
                                    v-model="propertyValues.capacity"
                    />
                  </div>

                  <div class="col cell-qu-edit-fields">
                    <radio v-model="property.capacity_mode" :val="0" :disabled="pending"
                           name="capacity_mode">{{ $t('masterData.capacityRooms') }}</radio>
                    <radio v-model="property.capacity_mode" :val="1" :disabled="pending"
                           name="capacity_mode">{{ $t('masterData.capacityBeds') }}</radio>
                  </div>
                </div>
                <div class="row ">
                  <p class="col-12 head-line">
                    {{ $t('masterData.propertyTel') }}<span class="required">*</span>
                    <spinner v-if="verifyingTel"/>
                  </p>
                </div>
                <div class="row">
                  <div class="col-md-3 col-sm">
                    <ValidatedField group-class=""
                                    name="tel" mode="lazy" type="text"
                                    autocomplete="tel" v-model.trim="propertyValues.tel" :disabled="pending"
                                    :rules="telRules" :error-bag="validationError"/>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-5 col-sm input-padding-right">
                    <p class="head-line ">{{ $t('masterData.primaryEmail') }}<span class="required">*</span></p>
                    <ValidatedField rules="required|email" placeholder="name@company.com"
                                    type="email" name="email" v-model.trim="propertyValues.email"
                                    autocomplete="email" class="mb-2" :error-bag="validationError" :disabled="pending"/>
                    <p class="forMail">{{ $t('masterData.primaryEmailTip') }}</p>
                  </div>
                  <!-- <div class="col-md-3 col-sm input-padding-left">
                    <p class="head-line">{{ $t('masterData.altEmail') }}</p>
                    <ValidatedField rules="required|email" placeholder="name@company.com"
                                    type="email" name="alternaitve_email"
                                    v-model.trim="property.alternative_email" autocomplete="email"
                                    class="mb-2" :error-bag="validationError" :disabled="pending"/>
                    <p class="forMail">{{ $t('masterData.altEmailTip') }}</p>
                  </div> -->
                </div>
                <div class="row">
                  <p class="col-12 head-line">{{ $t('masterData.website') }}<span class="required">*</span></p>
                </div>
                <div class="row">
                  <div class="col-md-6 col-sm">
                    <ValidatedField rules="required_string|url" :disabled="pending"
                                    type="text" name="website_name" :placeholder="$t('masterData.website')"
                                    v-model="property.website"
                    />
                  </div>
                </div>
                <div class="row">
                  <div class="col-12">
                    <p
                      class="head-line"
                      :class="(property.hasMapped) ? 'opacity-50' : ''">{{ $t('masterData.chooseCurrency') }}</p>
                  </div>
                </div>
                <div class="row currency">
                  <div class="col-md-3 col-10" v-if="loadedCurrencies">
                    <drop-down
                      id="currency"
                      id-key="code"
                      label-key="text"
                      :items="allCurrencies"
                      :disabled="pending || property.hasMapped"
                      v-model="property.currency_code"
                    />
                  </div>
                  <div class="col-md-3 col-2" v-if="property.hasMapped">
                    <icon
                      class="icon-info"
                      :class="(currencyModal == 1) ? 'opacity-50' : ''"
                      @click="toggleCurrencyModal(1)"
                      width="25"
                      height="25"
                      type="info"/>
                  </div>
                  <div class="col-12" v-if="currencyModal">
                    <div class="modal-info">
                      <icon class="icon-info" width="25" height="25" type="info"/>
                      <p>{{ $t('masterData.currencyText') }}</p>
                      <icon class="close-info" @click="toggleCurrencyModal(0)" width="25" height="25" type="close"/>
                    </div>
                  </div>
                </div>
              </form>
            </ValidationObserver>
          </div>
          <div v-show="activetab === 1" class="tab-content">
            <ValidationObserver ref="form1">
              <form @submit.prevent="onSubmit">
                <div class="row">
                  <p class="col-12 head-line">{{ $t('masterData.street') }}<span class="required">*</span></p>
                </div>
                <div class="row">
                  <div class="col-md-6 col-sm">
                    <ValidatedField rules="required_string|max:100" :disabled="pending"
                                    type="text" name="street_no" :placeholder="$t('masterData.street')"
                                    v-model="address.street"
                    />
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-6 col-sm">
                    <ValidatedField rules="max:100" :disabled="pending"
                                    type="text" name="second_address" :placeholder="$t('masterData.street')"
                                    v-model="address.street_optional"
                    />
                  </div>
                </div>
                <div class="row">
                  <div class="col-12">
                    <div class="row">
                      <div class="col-md-3 col-sm  input-padding-right">
                        <p class="head-line ">{{ $t('masterData.zip') }}<span class="required">*</span></p>
                        <ValidatedField rules="required_string|max:10" :disabled="pending"
                                        type="text" name="post_code" :placeholder="$t('masterData.zip')"
                                        v-model.trim="address.zip"
                        />
                      </div>
                      <div class="col-md-3 col-sm input-padding-left">
                        <p class="head-line">{{ $t('masterData.city') }}<span class="required">*</span></p>
                        <ValidatedField rules="required_string|max:100" :disabled="pending"
                                        type="text" name="city" :placeholder="$t('masterData.city')"
                                        v-model="address.city"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-6 col-sm input-padding-left">
                    <p class="head-line">{{ $t('masterData.country') }}<span class="required">*</span></p>
                    <drop-down
                      id="country"
                      id-key="code"
                      label-key="name"
                      :items="countries"
                      :disabled="pending"
                      v-model="address.country"
                    />
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-6 col-sm input-padding-left">
                    <p class="head-line">{{ $t('masterData.stateOrProvince') }}</p>
                    <drop-down
                      id="state"
                      id-key="name"
                      label-key="name"
                      rules="required"
                      :items="states"
                      :disabled="pending"
                      v-model="address.state"
                    />
                  </div>
                </div>
                <div class="row">
                  <p class="col-12 head-line">{{ $t('masterData.geodata') }}</p>
                </div>
                <div class="row">
                  <div class="col-md-3 col-sm input-padding-right">
                    <ValidatedField rules="between:-90,90" placeholder="-"
                                    type="text" name="latitude" no-icon no-tooltip class="mb-2"
                                    v-model.trim="address.latitude" :disabled="pending"
                    />
                    <p class="forMail">{{ $t('masterData.latitude') }}</p>
                  </div>
                  <div class="col-md-3 col-sm input-padding-left">
                    <ValidatedField rules="between:-180,180"
                                    type="text" name="longitude" no-icon no-tooltip class="mb-2"
                                    placeholder="-" :disabled="pending"
                                    v-model.trim="address.longitude"
                    />
                    <p class="forMail">{{ $t('masterData.longitude') }}</p>
                  </div>
                  <div class="col-md-2 col-sm">
                    <b-button link block variant="primary"
                              :disabled="invalidGeoData"
                              target="_blank"
                              :href="locationUrl">
                      {{ $t('masterData.buttonShowLocation') }}
                    </b-button>
                  </div>
                </div>
                <div class="row">
                  <span class=" col-12 forMail">{{ $t('masterData.geodataTip') }}
                    <a href="https://www.revilodesign.de/tools/google-maps-latitude-longitude-finder/"
                       target="_blank">revilodesign.de</a></span>
                </div>
              </form>
            </ValidationObserver>
          </div>
          <div v-show="activetab === 2" class="tab-content">
            <ValidationObserver ref="form2">
              <form @submit.prevent="onSubmit">
                <div
                  v-for="(identifier, i) in identifiers"
                  :key="identifier.id"
                  class="row"
                >
                  <p class="col-12 head-line">{{ identifier.name }}</p>
                  <div class="col-md-6 col-sm">
                    <ValidatedField
                      rules="max:100"
                      type="text" :name="identifier.abbreviation" no-icon no-tooltip
                      v-model="identifiers[i].value" :disabled="pending"
                    />
                  </div>
                </div>
              </form>
            </ValidationObserver>
          </div>
          <div v-show="activetab === 3" class="tab-content">
            <ValidationObserver ref="form3">
              <form @submit.prevent="onSubmit">
                <div class="position-relative panel-content">
                  <div class="d-none d-md-block">
                    <div class="room-table">
                      <table class="w-100">
                        <thead>
                          <tr>
                            <th class="w-name">{{ $t('masterData.certsName') }}</th>
                            <th class="w-upload-date">{{ $t('masterData.certsUploadDate') }}</th>
                            <th class="w-stars">{{ $t('masterData.certsStars') }}</th>
                            <th class="text-right">{{ $t('masterData.certsIssuedBy') }}</th>
                          </tr>
                        </thead>

                        <tbody v-for="(row, idx) in certificates" :key="idx">
                          <tr class="separator before"></tr>
                          <tr>
                            <td>
                              <p>{{row.name}}</p>
                            </td>
                            <td>
                              <p>{{row.uploadDate}}</p>
                            </td>
                            <td>
                              <b-form-rating :id="`rating-inline-${idx}`" :value='row.value'></b-form-rating>
                            </td>
                            <td class="text-right nr">
                              <p>{{row.issuedBy}}</p>
                            </td>
                          </tr>
                          <tr class="separator after"></tr>
                        </tbody>
                      </table>
                    </div>
                    <div class="d-xl-flex">
                      <b-btn pill variant="outline-primary" class="add-certificate">
                        <icon width="10" height="10" type="plus"/>
                        {{ $t('masterData.buttonAddCertificate') }}
                      </b-btn>
                    </div>
                  </div>

                  <div class="d-md-none" v-for="(row, idx) in certificates" :key="idx">
                    <div class="d-flex dots-wrap">
                      <div class="dots">
                        <b-dropdown size="sm" toggle-tag="span" variant="link" no-caret right :disabled="pending">
                          <template #button-content>
                            <icon width="20" height="19" class="label" type="dots-h"/>
                          </template>
                        </b-dropdown>
                      </div>
                    </div>
                    <div class="d-flex">
                      <table class="w-100">
                        <tbody>
                          <tr class="tr-wrap">
                            <td class="tb-title"><p>{{ $t('masterData.certsName') }}</p></td>
                            <td class="tb-content"><p>{{row.id}}</p></td>
                          </tr>
                          <tr class="tr-wrap">
                            <td class="tb-title"><p>{{ $t('masterData.certsUploadDate') }}</p></td>
                            <td class="tb-content"><p>12 Jan 2020</p></td>
                          </tr>
                          <tr class="tr-wrap">
                            <td class="tb-title"><p>{{ $t('masterData.certsStars') }}</p></td>
                            <td class="tb-content">
                              <b-form-rating :id="`rating-inline-sm-${idx}`" :value="row.value"></b-form-rating>
                            </td>
                          </tr>
                          <tr class="tr-wrap">
                            <td class="tb-title"><p>{{ $t('masterData.certsIssuedBy') }}</p></td>
                            <td class="tb-content"><p>12 Jan 2020</p></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div class="add-certificate-sm d-md-none">
                    <b-btn pill variant="outline-primary" class="add-certificate col-12">
                      <icon width="10" height="10" type="plus"/>
                      {{ $t('masterData.button-add-certificate') }}
                    </b-btn>
                  </div>
                </div>
              </form>
            </ValidationObserver>
          </div>
        </div>
      </div>
      <div class="panel-footer" v-if="activetab !== 3">
        <div class="col-md-3 col-12 align-self-end cell-button">
          <SubmitButton type="button" :disabled="formInvalid" v-if="activetab >= 0"
                        :loading="pending" @click="onSubmit"
          >{{ $t('buttons.save') }}</SubmitButton>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import { mapActions, mapGetters, mapState } from 'vuex';

  export default {
    name: 'MasterData',
    data() {
      return {
        activetab: -1,
        tabs: [
          'masterData.tabsProperty',
          'masterData.tabsAddress',
          'masterData.tabsIds',
          'masterData.tabsCerts',
        ],
        propertyValues: {},
        address: {},
        propertyData: null,
        currencyModal: 0,
        logo: null,
        identifiers: [],
        verifyingTel: false,
        certificates: {
          0: {
            name: '3 days before arrival',
            uploadDate: '12 Jan 2020',
            value: 4,
            issuedBy: '2 Jan 2020',
          },
          1: {
            name: '3 days before arrival',
            uploadDate: '12 Jan 2020',
            value: 5,
            issuedBy: '2 Jan 2020',
          },
        },
      };
    },
    watch: {
      user: function watchUser(userData) {
        if (userData) {
          this.updateUserData();
        }
      },
      'address.country': {
        handler(newVal, oldVal) {
          if ((newVal.length !== 0) && (newVal !== oldVal)) {
            this.fetchStates({
              country_id: newVal,
            });
          }
        },
      },
    },
    async created() {
      await this.getRoomDBPropertyId();
      // await this.getUser();
      await Promise.allSettled([
        this.fetchCountries(),
        this.fetchPropertyTypes(),
        this.fetchCurrencies(),
        this.getDescription(),
        this.getProperty().then((data) => {
          this.propertyData = data;
          return true;
        }),
        this.getIdentifierSources().then(async (identifierSources) => {
          this.identifiers = identifierSources;
          const identifiersData = await this.getPropertyIdentifiers(this.propertyData.id);
          identifiersData.forEach((data) => {
            const identifier = this.identifiers.find((item) => item.id === data.source.id);
            if (!identifier) return;
            identifier.value = data.identifier;
          });
          return null;
        }),
      ]);
      this.updateUserData();
      // this.validatePhone();
      this.activetab = 0;
    },
    computed: {
      ...mapGetters('data', ['countries', 'states', 'currencies', 'types', 'loadedCurrencies']),
      ...mapGetters('user', ['user', 'pending', 'validationError', 'property', 'lang']),
      ...mapState('user', ['propertiesPending']),
      ...mapState('description', ['descriptions', 'pmsError']),
      allCurrencies() {
        return this.currencies.map(({ id, name, code }) => ({ id, text: `${name} (${code})`, code }));
      },
      allTypes() {
        if ((typeof (this.types.data) !== 'undefined')) {
          return this.types.data.result.map(({ id, name }) => ({
            id,
            name,
          }));
        }
        return [];
      },
      invalidGeoData() {
        const { latitude, longitude } = this.address;
        if (latitude == null || longitude == null) return true;
        return !latitude.length || !longitude.length
          || !(Math.abs(longitude) <= 180)
          || !(Math.abs(latitude) <= 90);
      },
      locationUrl() {
        if (this.invalidGeoData) return '';
        // return `https://www.google.com/maps/@${this.address.latitude},${this.address.longitude},15z`;
        return `https://www.google.com/maps/place/${this.address.latitude},${this.address.longitude}`;
      },
      activeForm() {
        return this.$refs[`form${this.activetab}`];
      },
      formInvalid() {
        const form = this.activeForm;
        return form != null ? form.flags.invalid : true;
      },
      telRules() {
        return {
          required: true,
          max: 20,
        };
      },
    },
    methods: {
      ...mapActions('data', ['fetchCountries', 'fetchStates', 'fetchCurrencies', 'fetchPropertyTypes']),
      ...mapActions('user', ['getUser', 'getProperty', 'updateProperty', 'verifyPhone', 'getRoomDBPropertyId', 'getIdentifierSources', 'getPropertyIdentifiers', 'updatePropertyIdentifiers']),
      ...mapActions('description', ['getDescription']),
      setTab(tab) {
        switch (this.activetab) {
          case 0:
            this.resetPropertyForm();
            break;
          case 1:
            this.resetAddressForm();
            break;
          default:
            break;
        }
        this.activetab = tab;
      },
      async onSubmit() {
        if (this.activeForm.flags.invalid) return;
        try {
          const { code: lang } = this.lang;
          if (this.activetab === 0) {
            const { upload, remove } = this.logo;
            await this.updateProperty({
              partial: true,
              ...this.propertyValues,
              descriptions: this.descriptions,
              logo: { upload, remove },
              lang,
            });
          }
          if (this.activetab === 1) {
            await this.updateProperty({
              partial: true,
              descriptions: this.descriptions,
              ...this.address,
              lang,
            });
          } else if (this.activetab === 2) {
            await this.updatePropertyIdentifiers(this.identifiers);
          }
          this.activeForm.reset();
          this.$toastr.s({
            title: this.$t('masterData.alertSaved'),
            msg: '',
            timeout: 3000,
            progressbar: false,
          });
        } catch (error) {
          this.$toastr.e(error.message, this.$t('error'));
        }
        // this.$refs.title.scrollIntoView();
      },
      resetPropertyForm(resetForm = true) {
        const {
          // eslint-disable-next-line camelcase
          email, name, type, tel, alternative_email, website, capacity, currency_code,
          capacity_mode: cmode, hasMapped, logo,
        } = JSON.parse(JSON.stringify(this.propertyData));
        // eslint-disable-next-line camelcase
        const capacity_mode = cmode != null ? cmode : 0;
        this.propertyValues = {
          email,
          name,
          type,
          tel,
          alternative_email,
          website,
          capacity,
          capacity_mode,
          currency_code,
          hasMapped,
          logo,
        };
        this.logo = {
          original: this.property.logo || null,
          upload: null,
          remove: false,
        };
        if (resetForm) {
          this.$nextTick(() => {
            this.$refs.form0.reset();
          });
        }
      },
      resetAddressForm(resetForm = true) {
        const {
          // eslint-disable-next-line camelcase
          street, street_optional, zip, city, federal_state, state, country, latitude, longitude,
        } = JSON.parse(JSON.stringify(this.propertyData));
        this.address = {
          street, street_optional, zip, city, federal_state, state, country, latitude, longitude,
        };
        if (resetForm) {
          this.$nextTick(() => {
            this.$refs.form1.reset();
          });
        }
      },
      updateUserData() {
        this.resetPropertyForm();
        this.resetAddressForm();
      },
      toggleCurrencyModal(id) {
        this.currencyModal = id;
      },
      initProperty() {
        // this.property = {};
        // this.address = {};
        // this.profile = {};
      },
    },
  };
</script>
