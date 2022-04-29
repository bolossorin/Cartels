import React from 'react'
import BalanceItem from '../_common/BalanceItem'
import { ROULETTE_BLACKS } from './constants'

function getColorFromNumber(number) {
    const num = `${number}`
    if (num === '0') return 'g'

    return ROULETTE_BLACKS.includes(num) ? 'b' : 'r'
}

function RouletteBoardCockpit({ totalPlaced, pastResults, result, spinning }) {
    let results = pastResults
    if (window?.innerWidth <= 1150) {
        results.splice(3)
    }
    let landedColor = getColorFromNumber(result?.landedPosition)
    let landedNumber = result?.landedPosition
    if (spinning) {
        landedColor = 'neutral'
        landedNumber = '?'
    }

    const shouldHidePrevResult = landedNumber !== pastResults?.[0] && spinning

    return (
        <div className={`roulette__board__cockpit`}>
            <div className={`roulette__board__cockpit__results`}>
                <div className={`roulette__board__cockpit__results__title`}>
                    Results
                </div>
                <div className={`roulette__board__cockpit__results__grid`}>
                    {!results && <>&nbsp;</>}
                    {results?.map((pastResult, key) => {
                        let color = getColorFromNumber(pastResult)
                        let number = pastResult
                        if (key === 0 && shouldHidePrevResult) {
                            color = 'neutral'
                            number = '?'
                        }

                        return <p className={`roulette__${color}`}>{number}</p>
                    })}
                </div>
            </div>
            <div className={`roulette__board__cockpit__result`}>
                {result ? (
                    <p
                        className={`roulette__${landedColor} ${
                            !spinning ? `roulette__pulsate` : ''
                        }`}
                    >
                        <span>{landedNumber}</span>
                    </p>
                ) : (
                    <p className={`roulette__undef`}>~</p>
                )}
            </div>
            <div className={`roulette__board__cockpit__info`}>
                <div className={`roulette__board__cockpit__info__title`}>
                    Current
                </div>
                <BalanceItem
                    value={totalPlaced}
                    currency={'cash'}
                    showFull
                    countDuration={0.4}
                />
            </div>
        </div>
    )
}

export default RouletteBoardCockpit
