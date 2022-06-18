<template>
  <span class="current">
    {{ $t('payments.methodsActive') }}
    <b-badge variant="none">
      <icon type="check" width="8" height="8"/>
    </b-badge>
  </span>
</template>

<script>
  export default {
    name: 'ActivePaymentBadge',
  };
</script>

<style scoped>

</style>
