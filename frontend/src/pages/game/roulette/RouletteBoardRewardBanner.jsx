import React from 'react'
import { ROULETTE_CHIPS } from './constants'
import BalanceItem from '../_common/BalanceItem'

function DisplayNodes({ nodes }) {
    if (!nodes) return null

    return (
        <>
            {nodes.map(({ id, nodeType, nodeData }) => {
                if (nodeType === 'text') {
                    return <span key={id}>{nodeData[0]}</span>
                }
                if (nodeType === 'currency') {
                    return (
                        <BalanceItem
                            key={id}
                            currency={nodeData[0]}
                            value={`${nodeData[1]}`}
                            showFull
                            countDuration={0.6}
                        />
                    )
                }
            })}
        </>
    )
}

function RouletteBoardRewardBanner({ chip, result, loading, spinning }) {
    const wheelSpinning = loading || spinning
    const noResultToShow = !(result || wheelSpinning)
    let bannerText = `Place your bets`
    if (!chip) {
        bannerText = `Select a chip amount`
    }

    return (
        <div
            className={`roulette__board__reward roulette__board__reward__${
                wheelSpinning ? 'neutral' : result?.banner?.displayType
            }`}
        >
            {spinning && <p>Spinning...</p>}
            {noResultToShow && <p>{bannerText}</p>}
            {!wheelSpinning && result && (
                <p>
                    <DisplayNodes nodes={result?.banner?.nodes} />
                </p>
            )}
        </div>
    )
}

export default RouletteBoardRewardBanner
