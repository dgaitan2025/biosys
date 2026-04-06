<template>
  <div class="table-container">
    <table class="app-table">
      <thead>
        <tr>
          <th v-for="column in columns" :key="column.key">
            {{ column.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in rows" :key="index">
          <td v-for="column in columns" :key="column.key">
            {{ row[column.key] }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({
  columns: {
    type: Array,
    default: () => []
  },
  rows: {
    type: Array,
    default: () => []
  }
})
</script>

<style scoped>
.table-container {
  overflow-x: auto;
}

.app-table {
  width: 100%;
  border-collapse: collapse;
}

.app-table th,
.app-table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: left;
}
</style>