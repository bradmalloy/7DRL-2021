const config = {
    map: {
        width: 30,
        height: 30,
        resources: {
            iron: {
                baseChance: 0.3,
                generations: 2,
                minTiles: 20,
                baseAmountPerTile: 100,
                amountPerAdditionalTile: 150
            },
            coal: {
                baseChance: 0.15,
                generations: 1,
                minTiles: 15,
                baseAmountPerTile: 50,
                amountPerAdditionalTile: 100
            },
            copper: {
                baseChance: 0.25,
                generations: 2,
                minTiles: 15,
                baseAmountPerTile: 25,
                amountPerAdditionalTile: 50
            }
        }
    },
    game: {
        frameDelay: 250,
        buildingRefundRate: 0.5,
        pickaxeCooldownTime: 5000,
        pickaxeRewardMax: 15
    }
}

export { config };