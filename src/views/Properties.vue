<template>
  <div class="page-mealplans">
    <div class="panel-title position-relative w-100 title">
      <p>{{ $t('properties.title') }}</p>
    </div>
    <properties />
  </div>
</template>

<script>
  import Properties from '@/components/Pages/Properties.vue';

  export default {
    name: 'PageProperties',
    components: { Properties },
  };
</script>
