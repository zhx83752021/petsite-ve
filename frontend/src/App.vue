<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

onMounted(() => {
  // 初始化应用
  userStore.initApp()
})
</script>

<style>
#app {
  width: 100%;
  min-height: 100vh;
}
</style>
