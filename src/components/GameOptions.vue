<template>
    <section v-if="uiopt.uioption === 'game'">
        <div v-if="GBC?.cartridge.isRomLoaded">
            <div class="base">
                <div class="desc">
                    <h1>{{ GBC?.cartridge.title }}</h1>
                    <span>{{ GBC?.cartridge.compatibility }}</span>
                    <span>{{ GBC?.cartridge.license }}</span>
                    <div>
                        <span v-if="GBC?.cartridge.cardType[0]">{{ GBC?.cartridge.cardType[0].name }}</span>
                        <span v-else>{{ GBC?.cartridge.cardType }}</span>
                        <span v-if="GBC?.cartridge.cardType[1]"> SRAM </span>
                        <span v-if="GBC?.cartridge.cardType[2]"> BATTERY </span>
                        <span v-if="GBC?.cartridge.cardType[3]"> TIMER </span>
                        <span v-if="GBC?.cartridge.cardType[4]"> RUMBLE </span>
                    </div>
                    <span>{{ GBC?.cartridge.rom?.length }} bytes</span>
                    <span>{{ GBC?.cartridge.romBanksCount }} bancos de memoria</span>
                    <span v-if="GBC?.cartridge.ramBanksCount !== 0">{{
                        GBC?.cartridge.ramBanksCount
                    }}
                        bancos de ram</span>
                    <span>Checksum {{ GBC?.cartridge.checkSumValid }}</span>
                </div>
            </div>
            <div>

                <title>Compatibilidad</title>

                <title>Licencia</title>

                <title>Tipo de cartucho</title>

            </div>
            <div>
                <title>Tamaño de la ROM</title>
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
<style scoped>
.base {
    position: relative;
    width: 20rem;
    min-height: 10rem;
    background: lightblue;
    padding: 1rem;
    box-shadow: 0 0 3rem rgba(0, 0, 0, 0.5);
}

.base .desc {
    position: relative;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: column;
}

h1 {
    font-family: fantasy;
    color: #1D1561;
}

span {
    font-family: Arial, Helvetica, sans-serif;
    font-weight: 600;
    color: black;
}
</style>
