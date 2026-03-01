<template>
    <div>
        rates {{ rateIndex }}
        bricks {{ bricks }}

    </div>
</template>

<script>
import { minBricks, calculateBestRateIndex, diffMinutesDepartures } from '~/utils/trainFunctions'

export default {
    data() {
        return {
            response: {},
            price: [6, 5, 2, 16],
            votes: [3, 3, 2, 4],
            rates: [],
            rateIndex: null
        }
    },
    mounted() {
        this.rateIndex = calculateBestRateIndex(this.price, this.votes)
        diffMinutesDepartures(["12:00", "12:30"], "13:30")
        this.bricks = minBricks([5, 7, 9, 4, 11])
    }
}
</script>