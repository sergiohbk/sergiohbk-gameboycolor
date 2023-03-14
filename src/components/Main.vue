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
            <span v-if="romLoaded" class="title">Control del juego</span>
            <div v-if="romLoaded" class="flexrow">
                <button @click="GBC?.start"><span>start</span></button>
                <button @click="GBC?.stop"><span>stop</span></button>
                <button v-if="debug" @click="GBC?.pause"><span>pause</span></button>
                <button v-if="debug" @click="GBC?.resume"><span>resume</span></button>
            </div>
        </div>
        <OptionSelect></OptionSelect>
        <GameOptions :GBC=GBC></GameOptions>
        <CpuOptions :GBC="GBC" :fps="fps"></CpuOptions>
        <SettingsOptions @setDoubleSize="setDoubleSize" @setHalfSize="setHalfSize"></SettingsOptions>
    </div>
</template>
<script lang="ts">
import { GAMEBOYCOLOR } from "@/GAMEBOYCOLOR/gbc";
import { onMounted, ref, watch, watchEffect } from '@vue/runtime-core';
import OptionSelect from './OptionSelect.vue';
import { uiopt } from "@/tools/data";
import GameOptions from './GameOptions.vue';
import CpuOptions from "./CpuOptions.vue";
import SettingsOptions from "./SettingsOptions.vue";
import "./css/index.css"

export default ({
    name: "MainPage",
    setup() {
        let debug = ref<boolean>(true)
        let screenHeight = ref<string>("320px")
        let screenWidth = ref<string>("288px")
        let GBC : GAMEBOYCOLOR = new GAMEBOYCOLOR(debug.value)
        let fps = ref<number>(0)
        let romLoaded = ref<boolean>(false)

        onMounted(() => {
            GBC.assingCanvas(document.getElementById('screen') as HTMLCanvasElement)
        })

        watch(() => GBC?.debugMode, () => {
            if (GBC) {
                debug.value = GBC!.debugMode
            }
        })

        watchEffect(() => {
            setInterval(() => {
                fps.value = Math.trunc(GBC!.fps)
                romLoaded.value = GBC!.cartridge.isRomLoaded
            }, 1000)
        })

        function loadGame(event: any) {
            if (GBC) {
                //GBC!.reset()
                const file = event.target.files[0];
                if (!file) return;
                if (file.name.split('.').pop() !== 'gb' && file.name.split('.').pop() !== 'gbc') {
                    alert('El archivo no es de tipo .gb o .gbc')
                    return;
                }
                const reader = new FileReader();
                reader.readAsArrayBuffer(file);
                reader.onload = () => {
                    GBC!.load(reader.result as ArrayBuffer)
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
                    GBC!.loadBootrom(reader.result as ArrayBuffer)
                }
            }
        }

        function setHalfSize() {
            screenHeight.value = `${parseInt(screenHeight.value) / 2}px`;
            screenWidth.value = `${parseInt(screenWidth.value) / 2}px`;
        }

        function setDoubleSize() {
            console.log("ejecuta la funcion")
            screenHeight.value = `${parseInt(screenHeight.value) * 2}px`;
            screenWidth.value = `${parseInt(screenWidth.value) * 2}px`;
        }

        function setDebug() {
            if (GBC) {
                GBC!.debugMode = !GBC!.debugMode
            }
        }

        return {
            debug,
            screenHeight,
            screenWidth,
            GBC,
            setDebug,
            screen,
            fps,
            romLoaded,
            loadGame,
            loadBoot,
            uiopt,
            SettingsOptions,
            setDoubleSize,
            setHalfSize
        }
    },

    components: {
        OptionSelect,
        GameOptions,
        CpuOptions,
        SettingsOptions
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