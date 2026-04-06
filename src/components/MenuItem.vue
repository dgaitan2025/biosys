<template>
  <div>
    <!-- Si tiene hijos -->
    <v-list-group
      v-if="item.children && item.children.length"
      :value="item.id"
    >
      <template #activator="{ props }">
        <v-list-item
          v-bind="props"
          :prepend-icon="item.icon || 'mdi-menu'"
          :title="item.title"
        />
      </template>

      <MenuItem
        v-for="child in item.children"
        :key="child.id"
        :item="child"
      />
    </v-list-group>

    <!-- Si no tiene hijos -->
    <v-list-item
      v-else
      :prepend-icon="item.icon || 'mdi-file-document-outline'"
      :title="item.title"
      :to="item.path"
      rounded="lg"
    />
  </div>
</template>

<script setup>
defineProps({
  item: {
    type: Object,
    required: true
  }
})
</script>