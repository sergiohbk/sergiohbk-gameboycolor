<template>
    <div>
        <section v-if="uiopt.uioption === 'cpu'">
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
                        <td>ultimo valor stack</td>
                        <td>{{ GBC?.memory.mem[GBC?.cpu.SP - 1] }}</td>
                    </tr>
                    <tr>
                        {{ GBC?.cpu.CPUSTATE }}
                    </tr>
                </tbody>
            </table>
        </section>
    </div>
</template>
<script lang="ts">
import { uiopt } from '@/tools/data';
export default ({
    name: "CpuOptions",
    props: ["GBC", "fps"],
    setup() {
        return {
            uiopt
        };
    }
})
</script>
<style scoped>

</style>
