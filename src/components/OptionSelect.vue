<template>
    <div class="main">
        <div class="nav">
            <span id="optSelect" style="--i:0; --x:-1; --y:0">
                <i id="cpu" class="bi bi-cpu"></i></span>
            <span id="optSelect" style="--i:0.5; --x:1; --y:0">
                <i id="timer" class="bi bi-stopwatch"></i></span>
            <span id="optSelect" style="--i:1; --x:0; --y:-1">
                <i id="gpu" class="bi bi-gpu-card"></i></span>
            <span id="optSelect" style="--i:1.5; --x:0; --y:1">
                <i id="apu" class="bi bi-music-note-beamed"></i></span>
            <span id="optSelect" style="--i:2; --x:-1; --y:-1">
                <i id="game" class="bi bi-controller"></i></span>
            <span id="optSelect" style="--i:2.5; --x:1; --y:1">
                <i id="general" class="bi bi-sliders"></i></span>
            <span id="optSelect" style="--i:3; --x:-1; --y:1">
                <i id="interrupts" class="bi bi-signpost-2"></i></span>
            <span id="optSelect" style="--i:3.5; --x:1; --y:-1">
                <i id="memory" class="bi bi-sd-card"></i></span>
        </div>
        <div class="close">
            <i class="bi bi-x"></i>
        </div>
    </div>
</template>
<script lang="ts">
import { onMounted } from "@vue/runtime-core";
import { uiopt } from '@/tools/data';

export default {
    name: "OptionSelect",
    setup() {
        let nav: HTMLElement | null = null;
        let close: HTMLElement | null = null;
        let spans: HTMLSpanElement[] = [];
        onMounted(() => {
            nav = document.querySelector(".nav");
            close = document.querySelector(".close");
            spans = Array.from(document.querySelectorAll('[id="optSelect"]'))

            nav!.onclick = () => {
                nav!.classList.add("active");
                close!.classList.add("active");
            };
            close!.onclick = () => {
                nav!.classList.remove("active");
                close!.classList.remove("active");
            };
            spans.map((span) => {
                span.onclick = () => {
                    document.querySelectorAll("i").forEach((i) => {
                        i.classList.remove("selected");
                    });
                    span.querySelector("i")!.classList.add("selected");
                    uiopt.uioption = span.querySelector("i")!.id;
                };
            });
        });

        return {
            nav,
            close,
            spans
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

.nav.active span i.selected {
    color: rgb(89, 114, 225);
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

