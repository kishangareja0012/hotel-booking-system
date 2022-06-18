<template>
  <div class="panel panel-form" v-if="!sending">
    <div class="panel-body">
      <img class="panel-image" src="/assets/images/cloud.svg" alt="Cloud image"/>
      <h1>{{ $t('join.title') }}</h1>
      <p>{{ $t('join.error.content') }}</p>
    </div>
  </div>
</template>

<script>
  import { mapGetters, mapActions } from 'vuex';

  export default {
    name: 'JoinProperty',
    data() {
      return {
        sending: false,
      };
    },
    computed: {
      ...mapGetters('user', ['user']),
    },
    methods: {
      ...mapActions('user', ['makeJoinProperty']),
    },
    created() {
      // check for verification link
      // eslint-disable-next-line camelcase
      const { id, property_id: propertyId, hash } = this.$route.params;

      // eslint-disable-next-line no-bitwise
      if ((id != null) ^ (hash != null)) {
        this.$router.replace({ name: this.$route.name });
        return;
      }
      if (id && propertyId) {
        this.sending = true;
        const { query } = this.$route;
        this.makeJoinProperty({
          id,
          propertyId,
          hash,
          query,
        });
      }
    },
  };
</script>
