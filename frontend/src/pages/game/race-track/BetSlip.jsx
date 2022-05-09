import React, { useState } from 'react'
import Button from '../../_common/Button'
import useEvent from '../../../hooks/useEvent'

function RaceTrackBetSlip({ handleBet, spinning, selectedHorse }) {
    const triggerEvent = useEvent()
    const [displayedText, setDisplayedText] = useState('')

    function handleUpdate(evt) {
        const value = `${evt?.target?.value}`.replace(/\D/g, '')
        if (value) {
            setDisplayedText(`$` + parseInt(value).toLocaleString())
        } else {
            setDisplayedText('')
        }
    }

    function handleAdjust(multiplier) {
        if (displayedText === '0') return
        let adjusted =
            parseInt(`${displayedText}`.replace(/\D/g, '')) * multiplier

        if (adjusted > Number.MAX_SAFE_INTEGER) {
            adjusted = 1337
        } else {
            if (isNaN(adjusted) || adjusted < 100) {
                adjusted = 100
            }
        }

        setDisplayedText(`$` + adjusted.toLocaleString())
        triggerEvent({
            name: 'RACE_TRACK_BET_MULTIPLIER',
            details: {
                multiplier,
                adjusted,
            },
        })
    }

    return (
        <>
            <div className={`race-track__bet-slip`}>
                <div className={`race-track__bet-slip__adjust`}>
                    ADJUST BET
                    <Button
                        type={`tertiary`}
                        color={`white`}
                        onClick={() => handleAdjust(0.5)}
                    >
                        0.5x
                    </Button>
                    <Button
                        type={`tertiary`}
                        color={`white`}
                        onClick={() => handleAdjust(2)}
                    >
                        2x
                    </Button>
                    {/*<Button*/}
                    {/*    type={`tertiary`}*/}
                    {/*    color={`white`}*/}
                    {/*    onClick={() => {}}*/}
                    {/*>*/}
                    {/*    MAX*/}
                    {/*</Button>*/}
                </div>
                <div className={`race-track__bet-slip__input`}>
                    <input
                        type="text"
                        inputMode="numeric"
                        value={displayedText}
                        onChange={handleUpdate}
                    />
                </div>
                <div className={`race-track__bet-slip__control`}>
                    <Button
                        type={`primary`}
                        color={`blue`}
                        onClick={() =>
                            handleBet(`${displayedText}`.replace(/\D/g, ''))
                        }
                        disabled={
                            displayedText === '' || spinning || !selectedHorse
                        }
                    >
                        Place Bet
                    </Button>
                </div>
            </div>
        </>
    )
}

export default RaceTrackBetSlip
