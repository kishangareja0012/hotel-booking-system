<template>
  <div class="page-mealplans">
    <div class="panel-title position-relative w-100 title">
      <p>{{ $t('properties.title') }}</p>
    </div>
    <properties as-admin />
  </div>
</template>

<script>
  import Properties from '@/components/Pages/Properties.vue';

  export default {
    name: 'AdminPageProperties',
    components: { Properties },
  };
</script>
