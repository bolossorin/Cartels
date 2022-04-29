import React from 'react'
import { ROULETTE_CHIPS } from './constants'

function RouletteBoardChips({ chip, handleSelectChip }) {
    return (
        <div className={`roulette__board__chips`}>
            <div className={`roulette__board__chips__title`}>Select amount</div>
            <div className={`roulette__board__chips__select`}>
                {Object.entries(ROULETTE_CHIPS).map(
                    ([chipId, [value, img]]) => (
                        <img
                            key={chipId}
                            src={img}
                            alt={`${value} value chip`}
                            onClick={() => handleSelectChip(chipId)}
                            className={`roulette__board__chips__select__${
                                chip === chipId ? 'selected' : 'unselected'
                            }`}
                        />
                    )
                )}
            </div>
        </div>
    )
}

export default RouletteBoardChips
