<template>
  <div v-if="modelValue" class="dialog-backdrop">
    <div class="dialog">
      <slot />
      <button @click="$emit('update:modelValue', false)">Cerrar</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.dialog-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
}

.dialog {
  background: white;
  padding: 20px;
  border-radius: 10px;
  min-width: 300px;
}
</style>