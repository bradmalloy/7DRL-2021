const config = {
    map: {
        width: 30,
        height: 30,
        resources: {
            iron: {
                baseChance: 0.3,
                generations: 2,
                minTiles: 15
            },
            coal: {
                baseChance: 0.15,
                generations: 1,
                minTiles: 10
            }
        }
    },
    game: {
        frameDelay: 250
    }
}

export { config };