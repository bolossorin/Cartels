import React from 'react'
import Text from '../Text/Text'

import './RarityTag.scss'

function RarityTag({ rarity }) {
    let rarityColor = 'bodyGrey'
    if (rarity === 'Rare') {
        rarityColor = 'cyan'
    }
    if (rarity === 'Ultra Rare') {
        rarityColor = 'blue'
    }
    if (rarity === 'Legendary') {
        rarityColor = 'purple'
    }
    if (rarity === 'Epic') {
        rarityColor = 'pink'
    }

    return (
        <div className={`rarity-tag rarity-tag__${rarityColor}`}>
            <Text boldItalic {...{ [rarityColor]: true }}>
                {rarity}
            </Text>
        </div>
    )
}

export default RarityTag
