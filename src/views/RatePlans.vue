<template>
  <div class="page-rateplans">
    <div class="panel-title position-relative w-100 title">
      <p>{{ $t('ratePlans.title') }}</p>
    </div>
    <rate-plans/>
  </div>
</template>

<script>
  import RatePlans from '@/components/Pages/RatePlans.vue';

  export default {
    name: 'PageRatePlans',
    components: { RatePlans },
  };
</script>
