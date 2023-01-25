<template>
    <div class="main">
        <div class="Screens">
            <div class="lcd">
                <div v-if="GBC?.isStarted && debug" class="fps">
                    <h3>{{ fps }}</h3>
                </div>
                <canvas id="screen"></canvas>
            </div>
        </div>
        <div class="flexcolumn">
            <span class="title">Opciones de juego</span>
            <div class="flexrow">
                <input id="inputgame" type="file" @change="loadGame" style="display:none" />
                <button class="ibutton" onclick="document.getElementById('inputgame').click()"><span>Cargar
                        juego</span></button>
                <input id="inputboot" type="file" @change="loadBoot" style="display:none" />
                <button class="ibutton" onclick="document.getElementById('inputboot').click()"><span>Cargar
                        GAMEBOYCOLOR intro</span></button>
            </div>
            <span v-if="GBC?.cartridge.isRomLoaded" class="title">Control del juego</span>
            <div v-if="GBC?.cartridge.isRomLoaded" class="flexrow">
                <button @click="GBC?.start"><span>start</span></button>
                <button @click="GBC?.stop"><span>stop</span></button>
                <button v-if="debug" @click="GBC?.pause"><span>pause</span></button>
                <button v-if="debug" @click="GBC?.resume"><span>resume</span></button>
            </div>
        </div>
        <OptionSelect></OptionSelect>
    </div>
</template>
<script lang="ts">
import { GAMEBOYCOLOR } from "@/GAMEBOYCOLOR/gbc";
import { onMounted, ref, watch, watchEffect } from '@vue/runtime-core';
import OptionSelect from './OptionSelect.vue'

export default ({
    name: "MainPage",
    setup() {
        let debug = ref<boolean>(true)
        let screenHeight = ref<string>("320px")
        let screenWidth = ref<string>("288px")
        let GBC = ref<GAMEBOYCOLOR | null>(null)
        let fps = ref<number>(0)

        onMounted(() => {
            GBC.value = new GAMEBOYCOLOR(document.getElementById('screen') as HTMLCanvasElement, debug.value)
        })

        watch(() => GBC.value?.debugMode, () => {
            if (GBC) {
                debug.value = GBC.value!.debugMode
            }
        })

        watchEffect(() => {
            setInterval(() => {
                fps.value = Math.trunc(GBC.value!.fps)
            }, 500)
        })

        function loadGame(event: any) {
            if (GBC) {
                GBC.value!.reset()
                const file = event.target.files[0];
                if (!file) return;
                if (file.name.split('.').pop() !== 'gb' && file.name.split('.').pop() !== 'gbc') {
                    alert('El archivo no es de tipo .gb o .gbc')
                    return;
                }
                const reader = new FileReader();
                reader.readAsArrayBuffer(file);
                reader.onload = () => {
                    GBC.value!.load(reader.result as ArrayBuffer)
                }
            }
        }

        function loadBoot(event: any) {
            if (GBC) {
                const file = event.target.files[0];
                if (!file) return;
                if (file.name.split('.').pop() !== 'bin' && file.name.split('.').pop() !== 'gbc') {
                    alert('El archivo no es de tipo .bin o .gbc')
                    return;
                }
                const reader = new FileReader();
                reader.readAsArrayBuffer(file);
                reader.onload = () => {
                    GBC.value!.loadBootrom(reader.result as ArrayBuffer)
                }
            }
        }

        function setHalfSize() {
            screenHeight.value = `${parseInt(screenHeight.value) / 2}px`;
            screenWidth.value = `${parseInt(screenWidth.value) / 2}px`;
        }

        function setDoubleSize() {
            screenHeight.value = `${parseInt(screenHeight.value) * 2}px`;
            screenWidth.value = `${parseInt(screenWidth.value) * 2}px`;
        }

        function setDebug() {
            if (GBC) {
                GBC.value!.debugMode = !GBC.value!.debugMode
            }
        }

        return {
            debug,
            screenHeight,
            screenWidth,
            GBC,
            setHalfSize,
            setDoubleSize,
            setDebug,
            screen,
            fps,
            loadGame,
            loadBoot
        }
    },
    components: {
        OptionSelect
    }
});
</script>
<style scoped>
canvas {
    height: v-bind(screenHeight);
    width: v-bind(screenWidth);
    background-color: #FFFFFF;
    image-rendering: pixelated;
    z-index: 1;
}

.lcd {
    position: relative;
    padding: 0.3rem;
}

.fps {
    position: absolute;
    right: 1rem;
    z-index: 2;
    top: 0.1rem;
    font: 600 0.6rem sans-serif;
    color: black;
}

.cardridgeinfo {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    border: 0.2rem dashed #FFF;
    background-color: var(--secondary);
    padding: 0.5rem;
    gap: 0.5rem;
}

/* table design */
table {
    table-layout: fixed;
    border-collapse: collapse;
    border: 1px solid white;
    background-color: darkgrey;
    max-width: 300px;
}

th,
td {
    padding: 0.5rem;
    text-align: left;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-weight: 600;
}

thead {
    background-color: var(--secondary);
    color: white;
}

thead tr {
    display: block;
    position: relative;
}

tr:nth-child(even) {
    background-color: var(--secondary);
}

tbody {
    display: block;
    overflow: auto;
    width: 100%;
    max-height: 250px;
}
</style>