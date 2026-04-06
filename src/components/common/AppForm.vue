<template>
  <form @submit.prevent="$emit('submit')">
    <slot />
    <button type="submit">Guardar</button>
  </form>
</template>

<script setup>
defineEmits(['submit'])
</script>