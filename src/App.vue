<template>
  <MainPage></MainPage>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import MainPage from './components/Main.vue';

@Options({
  components: {
    MainPage,
  },
})
export default class App extends Vue { }
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  --primary: #2E2E2E;
  --buttons: #657beb;
  --secondary: #3E3E3E;
  --buttons-hover: #304cd8;
  --buttons-active: #1f2f9d;
  --important-buttons: #d2c9f3;
  --important-buttons-hover: #b8aee8;
  --important-buttons-active: #8e7ec8;
  color: white;
  background-color: var(--primary);
  background-image: url(@/assets/gengar.png);
  background-position: center;
  background-size: contain;
}
</style>
