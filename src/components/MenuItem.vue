<template>
  <div>
    <v-list-group
      v-if="tieneHijos(item)"
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

    <v-list-item
      v-else
      :prepend-icon="item.icon || 'mdi-file-document-outline'"
      :title="item.title"
      :to="esRutaValida(item) ? item.path : undefined"
      :link="esRutaValida(item)"
      rounded="lg"
    />
  </div>
</template>

<script setup>
const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const tieneHijos = (item) => Array.isArray(item.children) && item.children.length > 0
const esRutaValida = (item) => item.id_menu === 3 && !!item.path
</script>