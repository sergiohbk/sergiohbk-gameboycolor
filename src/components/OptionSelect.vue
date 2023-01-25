<template>
    <div class="main">
        <div class="nav">
            <span style="--i:0; --x:-1; --y:0">
                <i class="bi bi-cpu"></i></span>
            <span style="--i:0.5; --x:1; --y:0">
                <i class="bi bi-stopwatch"></i></span>
            <span style="--i:1; --x:0; --y:-1">
                <i class="bi bi-gpu-card"></i></span>
            <span style="--i:1.5; --x:0; --y:1">
                <i class="bi bi-music-note-beamed"></i></span>
            <span style="--i:2; --x:-1; --y:-1">
                <i class="bi bi-controller"></i></span>
            <span style="--i:2.5; --x:1; --y:1">
                <i class="bi bi-sliders"></i></span>
            <span style="--i:3; --x:-1; --y:1">
                <i class="bi bi-signpost-2"></i></span>
            <span style="--i:3.5; --x:1; --y:-1">
                <i class="bi bi-motherboard"></i></span>
        </div>
        <div class="close">
            <i class="bi bi-x"></i>
        </div>
    </div>
</template>
<script lang="ts">
import { onMounted, ref } from "@vue/runtime-core";

export default {
    name: "OptionSelect",
    setup() {
        const nav = ref<HTMLElement | null>(null);
        const close = ref<HTMLElement | null>(null);

        onMounted(() => {
            nav.value = document.querySelector(".nav");
            close.value = document.querySelector(".close");

            nav.value!.onclick = () => {
                nav.value!.classList.add("active");
                close.value!.classList.add("active");
            };
            close.value!.onclick = () => {
                nav.value!.classList.remove("active");
                close.value!.classList.remove("active");
            };
        });

        return {
            nav,
            close,
        };
    }
}
</script>
<style scoped>
.main {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
}

.nav {
    display: flex;
    position: relative;
    width: 250px;
    height: 250px;
    cursor: pointer;
    justify-content: center;
    align-items: center;
    transition: 0.5s;
}

.nav span {
    position: absolute;
    width: 21px;
    height: 21px;
    background: #fff;
    transform: translate(calc(42px * var(--x)), calc(42px * var(--y)));
    transition: 0.5s, width 0.5s, height 0.5s;
    transition-delay: calc(0.1s * var(--i));
    display: flex;
    justify-content: center;
    align-items: center;
}

.nav.active span {
    width: 42px;
    height: 42px;
    transform: translate(calc(84px * var(--x)), calc(84px * var(--y)));
    transition: 0.5s, width 0.5s, height 0.5s;
    transition-delay: calc(0.1s * var(--i));
    background: #282d41;
    padding: 0.3rem;
}

.nav.active span:hover i {
    filter: drop-shadow(0 0 0.1rem white) drop-shadow(0 0 0.3rem rgb(89, 114, 225)) drop-shadow(0 0 0.3rem rgb(50, 77, 195));
}

.nav span i {
    font-size: 0em;
    transition: 0.4s;
}

.nav.active span i {
    font-size: 2rem;
    color: rgb(255, 255, 255);
}

.close {
    position: absolute;
    width: 21px;
    height: 21px;
    background: #fff;
    cursor: pointer;
    transition: 0.6s;
    transition-delay: 0.5s;
    pointer-events: none;
    display: flex;
    justify-content: center;
    align-items: center;
}

.close i {
    font-size: 0em;
    color: rgb(0, 0, 0);
    transition: 0.6s;
    transition-delay: 0.5s;
}

.nav.active~.close {
    width: 42px;
    height: 42px;
    transition-delay: 0.3s;
    pointer-events: initial;
    padding: 0.3rem;
    display: flex;
    justify-content: center;
    align-items: center;
}

.nav.active~.close i {
    font-size: 3rem;
    color: rgb(0, 0, 0);
    transition: 0.5s;
    transition-delay: 0.3s;
}

.nav.active~.close.active:hover i {
    rotate: 360deg;
}
</style>

