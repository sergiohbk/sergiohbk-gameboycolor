<template>
    <div class="Screens">
        <div v-if="debug" class="canvas1">
            <canvas></canvas>
        </div>
        <div v-if="debug" class="canvas2">
            <canvas></canvas>
        </div>
        <div class="canvas3">
            <div v-if="GBC?.isStarted && debug" class="fps">
                <h3>{{ fps }}</h3>
            </div>
            <canvas id="screen"></canvas>
        </div>
        <div v-if="debug" class="canvas4">
            <canvas></canvas>
        </div>
        <div v-if="debug" class="canvas5">
            <canvas></canvas>
        </div>
    </div>
    <section class="flexrow margin">
        <div v-if="GBC?.cartridge.isRomLoaded" class="cardridgeinfo">
            <div class="flexcolumn flexalignleft">
                <span class="title">Juego</span>
                <hr style="width:100%">
                <span class="title">Titulo</span>
                <span class="paddingleft">{{ GBC?.cartridge.title }}</span>
                <span class="title">Compatibilidad</span>
                <span class="paddingleft">{{ GBC?.cartridge.compatibility }}</span>
                <span class="title">Licencia</span>
                <span class="paddingleft">{{ GBC?.cartridge.license }}</span>
                <span class="title">Tipo de cartucho</span>
                <div class="paddingleft" style="display:flex, flex-direction:column; gap: 0.3rem">
                    <span v-if="GBC?.cartridge.cardType[0]">{{ GBC?.cartridge.cardType[0].name }}</span>
                    <span v-else>{{ GBC?.cartridge.cardType }}</span>
                    <span v-if="GBC?.cartridge.cardType[1]"> SRAM </span>
                    <span v-if="GBC?.cartridge.cardType[2]"> BATTERY </span>
                    <span v-if="GBC?.cartridge.cardType[3]"> TIMER </span>
                    <span v-if="GBC?.cartridge.cardType[4]"> RUMBLE </span>
                </div>
            </div>
            <div class="flexcolumn flexalignleft">
                <span class="title">Tamaño de la ROM</span>
                <span class="paddingleft">{{ GBC?.cartridge.rom?.length }} bytes</span>
                <span class="paddingleft">{{ GBC?.cartridge.romBanksCount }} bancos de memoria</span>
                <span v-if="GBC?.cartridge.ramBanksCount !== 0" class="title">Tamaño de la RAM</span>
                <span class="paddingleft" v-if="GBC?.cartridge.ramBanksCount !== 0">{{ GBC?.cartridge.ramBanksCount }}
                    bancos de ram</span>
                <span class="title">Checksum valido</span>
                <span class="paddingleft">{{ GBC?.cartridge.checkSumValid }}</span>
            </div>
        </div>
        <div class="flexcolumn border padding">
            <span class="title padding">Opciones de juego</span>
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
    </section>
    <section class="flexrow margin">
        <div class="flexcolumn border padding">
            <div class="flexcolumn">
                <button @click="setDebug">
                    <span v-if="debug">Desactivar modo debug</span>
                    <span v-else>Activar modo debug</span>
                </button>
                <div v-if="GBC?.bootrom.isBootromLoaded">
                    <h2 class="no-margin no-padding">BootRom</h2>
                </div>
                <div v-if="GBC?.bootrom.isBootromLoaded"><span>Gameboy color intro esta cargada</span> </div>
            </div>
            <div class="flexcolumn">
                <div class="flexrow border padding">
                    <span>modifica el tamaño de la pantallas</span>
                    <button @click="setDoubleSize"><span>+</span></button>
                    <button @click="setHalfSize"><span>-</span></button>
                </div>
            </div>
        </div>
    </section>
    <section v-if="debug" class="flexrow margin">
        <div>
            <table>
                <thead>
                    <tr>
                        <th>General Data</th>
                    </tr>
                </thead>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Valor</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Cycles</td>
                        <td>{{ GBC?.cycles }}</td>
                    </tr>
                    <tr>
                        <td>Fps</td>
                        <td>{{ fps }}</td>
                    </tr>
                    <tr>
                        <td>Double speed</td>
                        <td>{{ GBC?.doubleSpeed }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <table>
            <thead>
                <tr>
                    <th>CPU registers</th>
                </tr>
            </thead>
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Valor</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>PC</td>
                    <td>{{ GBC?.cpu.PC.toString(16) }}</td>
                </tr>
                <tr>
                    <td>SP</td>
                    <td>{{ GBC?.cpu.SP.toString(16) }}</td>
                </tr>
                <tr>
                    <td>A</td>
                    <td>{{ GBC?.cpu.A.toString(16) }}</td>
                </tr>
                <tr>
                    <td>BC</td>
                    <td>{{ GBC?.cpu.B.toString(16) }}{{ GBC?.cpu.C.toString(16) }}</td>
                </tr>
                <tr>
                    <td>DE</td>
                    <td>{{ GBC?.cpu.D.toString(16) }}{{ GBC?.cpu.E.toString(16) }}</td>
                </tr>
                <tr>
                    <td>HL</td>
                    <td>{{ GBC?.cpu.H.toString(16) }}{{ GBC?.cpu.L.toString(16) }}</td>
                </tr>
                <tr>
                    <td>zero flag</td>
                    <td>{{ GBC?.cpu.zeroFlag }}</td>
                </tr>
                <tr>
                    <td>subtract flag</td>
                    <td>{{ GBC?.cpu.subtractFlag }}</td>
                </tr>
                <tr>
                    <td>half carry flag</td>
                    <td>{{ GBC?.cpu.halfCarryFlag }}</td>
                </tr>
                <tr>
                    <td>carry flag</td>
                    <td>{{ GBC?.cpu.carryFlag }}</td>
                </tr>
                <tr>
                    <td>Stack length</td>
                    <td>{{ GBC?.cpu.stack.length }}</td>
                </tr>
                <tr v-if="GBC?.cpu.stack.length">
                    <td>Stack</td>
                    <td>{{ GBC?.cpu.stack[GBC?.cpu.stack.length - 1].toString(16) }}</td>
                </tr>
            </tbody>
        </table>
    </section>
</template>
<script lang="ts">
import { GAMEBOYCOLOR } from "@/GAMEBOYCOLOR/gbc";
import { onMounted, ref, watch, watchEffect } from '@vue/runtime-core';

export default {
    name: 'MainPage',
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
}
</script>
<style scoped>
.Screens {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    justify-content: center;
    align-content: flex-start;
    gap: 1rem;
}

canvas {
    height: v-bind(screenHeight);
    width: v-bind(screenWidth);
    background-color: #FFFFFF;
    image-rendering: pixelated;
    z-index: 1;
}

button {
    padding: 0.7rem;
    background-color: var(--buttons);
    border-radius: 0.2rem;
    border: none;
    box-shadow:
        0 1px 2px rgba(0, 0, 0, 0.07),
        0 2px 4px rgba(0, 0, 0, 0.07),
        0 4px 8px rgba(0, 0, 0, 0.07),
        0 8px 16px rgba(0, 0, 0, 0.07),
        0 16px 32px rgba(0, 0, 0, 0.07),
        0 32px 64px rgba(0, 0, 0, 0.07);
    text-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);
    cursor: pointer;
}

button>span {
    font: 700 1rem sans-serif;
    color: white;
}

button:hover {
    background-color: var(--buttons-hover);
}

button:active {
    background-color: var(--buttons-active);
}

.ibutton {
    background-color: var(--important-buttons);
}

.ibutton>span {
    font: 900 1.2rem sans-serif;
    color: royalblue;
}

.ibutton:hover {
    background-color: var(--important-buttons-hover);
}

.ibutton:active {
    background-color: var(--important-buttons-active);
}

.border {
    border: 0.2rem dashed #FFF;
    background-color: var(--secondary);
}

.padding {
    padding: 0.5rem;
}

.paddingleft {
    padding-left: 0.5rem;
}

.margin {
    margin: 0.5rem;
}

.no-margin {
    margin: 0;
}

.no-padding {
    padding: 0;
}

.flexcolumn {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
    flex-wrap: wrap;
    align-content: center;
}

.flexrow {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 1rem;
}

.flexalignleft {
    align-items: flex-start;
    justify-content: flex-start;
}

.canvas3 {
    position: relative;
    padding: 0.3rem;
    border: 0.2rem dashed #FFF;
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

.title {
    font: 900 1.5rem sans-serif;
    color: white;
}

span {
    font: 600 1rem sans-serif;
    color: white;
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