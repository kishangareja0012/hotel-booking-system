<template>
  <div class="page-admin-group">
    <div ref="title" class="panel-title position-relative w-100 title">
      <p>{{ groupName }}</p>
    </div>

    <tabs :items="tabs" v-model="activetab" withContent>
      <template #tab(properties)>
        <div class="tab-content tab-content-groups">
          <properties as-admin />
        </div>
      </template>
    </tabs>
  </div>
</template>

<script>
  import { mapActions, mapGetters, mapState } from 'vuex';
  import { HttpError } from '@/errors';
  import Properties from '@/components/Pages/Properties.vue';

  export default {
    name: 'Groups',
    components: { Properties },
    data() {
      return {
        activetab: 'properties',
        tabs: [
          { id: 'hotels', title: this.$t('adminGroups.manageTabsHotels') },
        ],
        id: null,
        filter: '',
        sort: '+id',
      };
    },
    mounted() {
      this.setGroupId(this.$route.params.id);
    },
    watch: {
      $route() {
        this.setGroupId(this.$route.params.id);
      },
    },
    computed: {
      ...mapGetters('group', ['loaded', 'group', 'properties']),
      ...mapState('group', ['error', 'pending', 'updatePending']),

      groupName() {
        if (!this.loaded) return '...';
        return this.group.name;
      },
      formInvalid() {
        return this.$refs.groupForm && this.$refs.groupForm.flags.invalid;
      },
    },
    methods: {
      ...mapActions('group', ['fetchData']),
      ...mapActions('users', ['createUser']),

      async setGroupId(id) {
        this.id = id;
        try {
          await this.fetchData({ id, force: true });
        } catch (e) {
          if (e instanceof HttpError && e.errorCode === 400) {
            await this.$router.replace({ name: 'groups' });
          }
        }
      },
    },
  };
</script>
