<template>
  <div class="page-masterdata">
    <div class="">
      <div ref="title" class="panel-title position-relative w-100 title">
        <p>{{ $t('settings.title') }}</p>
      </div>
      <div id="tabs">
        <div class="tabs">
          <a v-for="(tab, idx) in tabs" :key="`tab-${idx}`" :class="{ active: activetab === idx }">
            {{ $t(tab) }}
          </a>
        </div>
        <div class="">
          <div v-show="activetab === 0" class="tab-content">
            <ValidationObserver ref="form0">
              <form @submit.prevent="processForm">
                <div class="row">
                  <div class="col-12">
                    <p>
                      {{ $t('settings.autoReplenishmentTextOne') }}<br>
                      {{ $t('settings.autoReplenishmentTextTwo') }}
                    </p>
                  </div>
                </div>
                <div class="row">
                  <div class="col-12 col-md-8 d-flex justify-content-around">
                    <radio
                      name="activate"
                      v-model="activate"
                      :val="'Activate'"
                      :disabled="updatePending">
                      {{ $t('settings.enable') }}
                    </radio>
                    <radio
                      name="activate"
                      v-model="activate"
                      :val="'Deactivate'"
                      :disabled="updatePending">
                      {{ $t('settings.disable') }}
                    </radio>
                  </div>
                </div>
                <div class="row d-flex">
                  <div class="col-md-3 offset-md-9 col-12 align-self-end cell-button">
                    <SubmitButton type="submit">{{ $t('buttons.save') }}</SubmitButton>
                  </div>
                </div>
              </form>
            </ValidationObserver>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import { mapActions, mapGetters, mapState } from 'vuex';

  export default {
    name: 'Settings',
    data() {
      return {
        activetab: -1,
        tabs: [
          'settings.tabsAutoReplenishment',
        ],
        activate: '',
      };
    },
    watch: {},
    async created() {
      this.activetab = 0;
      await this.fetchData(true);
      this.activate = this.data;
    },
    mounted() {},
    computed: {
      ...mapGetters('settings', ['loaded']),
      ...mapState('settings', ['data', 'update', 'error', 'pending', 'updatePending']),
    },
    methods: {
      ...mapActions('settings', ['fetchData', 'updateData']),
      async processForm() {
        const AutoReplenishment = this.activate;
        try {
          await this.updateData({ AutoReplenishment });
          this.activate = this.update;
        } catch (e) {
          this.$toastr.e(e.message, 'Error');
        }
      },
    },
  };
</script>
