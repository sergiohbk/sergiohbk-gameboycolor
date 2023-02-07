<template>
    <div v-if="uiopt.uioption === 'general'">
        <div>
            <span>modifica el tamaño de la pantallas</span>
            <button @click="setDoubleSize"><span>+</span></button>
            <button @click="setHalfSize"><span>-</span></button>
        </div>
    </div>
</template>
<script lang="ts">
import { uiopt } from '@/tools/data';

export default ({
    name: "SettingsOptions",
    props: ["setDoubleSize", "setHalfSize"],
    setup() {
        return {
            uiopt
        }
    }
})
</script>