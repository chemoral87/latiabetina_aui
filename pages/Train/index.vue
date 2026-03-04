<template>
    <div>
        <!-- rates {{ rateIndex }}
        bricks {{ bricks }}
        batteries {{ batteries }}
        decodeCount {{ decodeCount }} -->
    </div>
</template>

<script>
import { tetris } from '~/utils/trainFunctions'

export default {
    data() {
        return {
            response: {},
            // price: [6, 5, 2, 16],
            // votes: [3, 3, 2, 4],
            // rates: [],
            // rateIndex: null,
            // bricks: null,
            // batteries: null
        }
    },
    mounted() {

        // this.rateIndex = calculateBestRateIndex(this.price, this.votes)
        // diffMinutesDepartures(["12:00", "12:30"], "13:30")
        // this.bricks = minBricks([5, 7, 9, 4, 11])
        // this.batteries = maxbatteryCharges(16, [2, 5, 6], [12, 8, 4]);
        // // this.decodeCount = decodePassword(123, [1, 23, 3, 12])
        // this.decodeCount = decodePassword(1221, [122, 1, 21, 31, 12])
        this.solution = tetris(4, 4, ["c", "b", "a"])
    }
}
</script>