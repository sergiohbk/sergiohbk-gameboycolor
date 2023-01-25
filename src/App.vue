<template>
  <div class="main">
    <MainPage></MainPage>
  </div>
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
  --primary: #191827;
  --buttons: #657beb;
  --secondary: #3E3E3E;
  --buttons-hover: #304cd8;
  --buttons-active: #1f2f9d;
  --important-buttons: #d2c9f3;
  --important-buttons-hover: #b8aee8;
  --important-buttons-active: #8e7ec8;
  color: white;
  background-color: var(--primary);
  margin: 2rem;
}

.main {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
