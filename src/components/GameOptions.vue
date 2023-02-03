<template>
    <section v-if="uiopt.uioption === 'game'">
        <div v-if="GBC?.cartridge.isRomLoaded" class="cardridgeinfo">
            <div>
                <title>Juego</title>
                <hr style="width:100%">
                <title>Titulo</title>
                <span>{{ GBC?.cartridge.title }}</span>
                <title>Compatibilidad</title>
                <span>{{ GBC?.cartridge.compatibility }}</span>
                <title>Licencia</title>
                <span>{{ GBC?.cartridge.license }}</span>
                <title>Tipo de cartucho</title>
                <div>
                    <span v-if="GBC?.cartridge.cardType[0]">{{ GBC?.cartridge.cardType[0].name }}</span>
                    <span v-else>{{ GBC?.cartridge.cardType }}</span>
                    <span v-if="GBC?.cartridge.cardType[1]"> SRAM </span>
                    <span v-if="GBC?.cartridge.cardType[2]"> BATTERY </span>
                    <span v-if="GBC?.cartridge.cardType[3]"> TIMER </span>
                    <span v-if="GBC?.cartridge.cardType[4]"> RUMBLE </span>
                </div>
            </div>
            <div>
                <title>Tamaño de la ROM</title>
                <span>{{ GBC?.cartridge.rom?.length }} bytes</span>
                <span>{{ GBC?.cartridge.romBanksCount }} bancos de memoria</span>
                <span v-if="GBC?.cartridge.ramBanksCount !== 0" class="title">Tamaño de la RAM</span>
                <span v-if="GBC?.cartridge.ramBanksCount !== 0">{{
                    GBC?.cartridge.ramBanksCount
                }}
                    bancos de ram</span>
                <span>Checksum valido</span>
                <span>{{ GBC?.cartridge.checkSumValid }}</span>
            </div>
        </div>
    </section>
</template>
<script lang="ts">
import { uiopt } from "@/tools/data";
export default ({
    name: "GameOptions",
    props: ["GBC"],
    setup() {
        return { uiopt };
    }
})
</script>
