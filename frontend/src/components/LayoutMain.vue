<template>
  <div class="layout-main">
    <AppHeader />
    <main class="main-content">
      <slot />
    </main>
    <AppFooter />
    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import AppHeader from './AppHeader.vue'
import AppFooter from './AppFooter.vue'
import BottomNav from './BottomNav.vue'
</script>

<style scoped lang="scss">
.layout-main {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  width: 100%;
}
</style>
