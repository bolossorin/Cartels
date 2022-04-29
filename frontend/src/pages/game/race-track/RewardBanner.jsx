import React from 'react'
import BalanceItem from '../_common/BalanceItem'

function DisplayNodes({ nodes, horses, odds }) {
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
                if (nodeType === 'horse') {
                    const horse = horses.filter((h) => h.id === nodeData[0])[0]
                    const horseOdds = odds.filter(
                        (o) => o.id === nodeData[0]
                    )?.[0]

                    return (
                        <span key={id} className={`race-track__reward__horse`}>
                            <img
                                src={`/static/img/track/silks/${horseOdds?.silk}.svg`}
                                alt={horse.name}
                            />
                            {horse.name}
                        </span>
                    )
                }
                return <></>
            })}
        </>
    )
}

function RaceTrackRewardBanner({
    selected,
    result,
    loading,
    spinning,
    horses,
    odds,
}) {
    const wheelSpinning = loading || spinning
    const noResultToShow = !(result || wheelSpinning)
    let bannerText = `Place your bets`
    if (!selected) {
        bannerText = `Select a horse`
    }

    return (
        <div
            className={`race-track__reward race-track__reward__${
                wheelSpinning ? 'neutral' : result?.banner?.displayType
            }`}
        >
            {spinning && <p>Racing...</p>}
            {noResultToShow && <p>{bannerText}</p>}
            {!wheelSpinning && result && (
                <p>
                    <DisplayNodes
                        nodes={result?.banner?.nodes}
                        horses={horses}
                        odds={odds}
                    />
                </p>
            )}
        </div>
    )
}

export default RaceTrackRewardBanner
