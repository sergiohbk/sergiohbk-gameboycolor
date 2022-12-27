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
  background-color: var(--primary);
  background-image: url(@/assets/gengar.png);
  background-position: center;
  background-size: contain;
}
</style>
