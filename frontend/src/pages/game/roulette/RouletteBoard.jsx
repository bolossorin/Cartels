import React, { useRef, useState } from 'react'

import { Image, Layer, Rect, Stage, Text } from 'react-konva'
import useImage from 'use-image'
import BoardHorizontal from 'assets/images/roulette/horizontal.png'
import Title from '../../_common/Title/Title'

import chip10 from 'assets/images/roulette/chips/10black.svg'
import chip100 from 'assets/images/roulette/chips/100blue.svg'
import chip1k from 'assets/images/roulette/chips/1kgreen.svg'
import chip5k from 'assets/images/roulette/chips/5korange.svg'
import chip10k from 'assets/images/roulette/chips/10kred.svg'
import chip100k from 'assets/images/roulette/chips/100kblack.svg'
import chip500k from 'assets/images/roulette/chips/500kpurple.svg'
import chip1m from 'assets/images/roulette/chips/1mpink.svg'
import chip10m from 'assets/images/roulette/chips/10mgold.svg'
import chip100m from 'assets/images/roulette/chips/100mteal.svg'
import Button from '../../_common/Button'
import BalanceItem from '../_common/BalanceItem'
import { ROULETTE_CHIPS, ROULETTE_TARGETS } from './constants'
import RouletteBoardChips from './RouletteBoardChips'
import RouletteBoardRewardBanner from './RouletteBoardRewardBanner'
import RouletteBoardCockpit from './RouletteBoardCockpit'
import useEvent from '../../../hooks/useEvent'
import { useToast } from '../_common/Toast'
import RouletteWheel from './RouletteWheel'
import { gql } from 'apollo-boost'
import { useMutation } from '@apollo/react-hooks'
import TextPill from '../_common/TextPill'

const is = (x) => ({
    between: (a, b) => x >= a && x <= b,
})

function determineTarget(x, y) {
    for (const [
        code,
        [details, xCenter, yCenter, width, height],
    ] of Object.entries(ROULETTE_TARGETS)) {
        const xBegin = xCenter - width / 2
        const xEnd = xCenter + width / 2
        const yBegin = yCenter - height / 2
        const yEnd = yCenter + height / 2
        let xBetween,
            yBetween = false

        if (is(x).between(xBegin, xEnd)) {
            xBetween = true
        }
        if (is(y).between(yBegin, yEnd)) {
            yBetween = true
        }

        if (xBetween && yBetween) {
            return [details, xBegin, yBegin, width, height, code]
        }
    }

    return null
}

const MAX_CHIPS_PER_PLACE = 15

const PLACE_BET_MUTATION = gql`
    mutation RoulettePageBet($input: BetRouletteInput!) {
        betRoulette(input: $input) {
            player {
                id
                cash
            }
            property {
                id
                propertyType
                currentState
                maximumBet
                player {
                    id
                    wealth
                }
                previousRouletteWinners
            }
            result {
                landedPosition
                banner {
                    displayType
                    nodes {
                        id
                        nodeType
                        nodeData
                    }
                }
            }
        }
    }
`

const WHEEL_HANG_TIME_MS = 0.8 * 1000

function RouletteBoard({ rect, property, rapid }) {
    const boardRef = useRef(null)
    const [betData, setBetData] = useState()
    const [spinning, setSpinning] = useState(false)
    const toast = useToast()
    const triggerEvent = useEvent()
    const [mutateBet, { loading }] = useMutation(PLACE_BET_MUTATION)
    const [HorizontalBoard] = useImage(BoardHorizontal)
    const [img10] = useImage(chip10)
    const [img100] = useImage(chip100)
    const [img1k] = useImage(chip1k)
    const [img5k] = useImage(chip5k)
    const [img10k] = useImage(chip10k)
    const [img100k] = useImage(chip100k)
    const [img500k] = useImage(chip500k)
    const [img1m] = useImage(chip1m)
    const [img10m] = useImage(chip10m)
    const [img100m] = useImage(chip100m)
    const [hoverTarget, setHoverTarget] = useState(undefined)
    const [chip, setChip] = useState(undefined)
    const [boardChips, setBoardChips] = useState({})

    const chipMap = {
        10: img10,
        100: img100,
        '1k': img1k,
        '5k': img5k,
        '10k': img10k,
        '100k': img100k,
        '500k': img500k,
        '1m': img1m,
        '10m': img10m,
        '100m': img100m,
    }

    function handleBoardMove(event) {
        const isMobileMove = event?.type === 'tap'

        let x = event.evt?.layerX
        let y = event.evt?.layerY
        if (isMobileMove) {
            const pointer = boardRef?.current?.getPointerPosition()
            x = pointer?.x
            y = pointer?.y
        }
        const target = determineTarget(x, y)

        if (Array.isArray(target)) {
            if (hoverTarget?.name !== target[0]) {
                const hoverTarget = {
                    xBegin: target[1],
                    yBegin: target[2],
                    width: target[3],
                    height: target[4],
                    name: target[0],
                    code: target[5],
                }

                setHoverTarget(hoverTarget)
                if (isMobileMove) {
                    handleBoardClick(hoverTarget, chip)
                }
            }
        } else {
            if (hoverTarget !== undefined) {
                setHoverTarget(undefined)
            }
        }
    }

    function handleBoardClick(target, chip) {
        if (!chip || loading) return

        const { name, code } = target
        const existingChips = boardChips[code]?.length ?? 0
        const x = ROULETTE_TARGETS[code][1] + existingChips * 1
        const y = ROULETTE_TARGETS[code][2] - existingChips * 1
        const boardChip = {
            code,
            chip,
            name,
            x,
            y,
            image: chipMap[code.replace('chip', '')],
        }

        if (existingChips >= MAX_CHIPS_PER_PLACE) {
            toast.add(
                'error',
                'Roulette Dealer',
                `You may only place ${MAX_CHIPS_PER_PLACE} chips per position.`,
                true
            )

            triggerEvent({
                name: 'ROULETTE_PLACE_CHIP_DENIED',
                details: {
                    existingChips,
                    chip,
                    targetName: name,
                    targetCode: code,
                },
            })

            return
        }

        triggerEvent({
            name: 'ROULETTE_PLACE_CHIP',
            details: {
                existingChips,
                chip,
                targetName: name,
                targetCode: code,
            },
        })

        setBoardChips({
            ...boardChips,
            [code]: [...(boardChips?.[code] ?? []), boardChip],
        })
    }

    function handleClear() {
        triggerEvent({
            name: 'ROULETTE_CLEAR_CHIPS',
        })

        setBoardChips({})
    }

    function handleSelectChip(newChip) {
        triggerEvent({
            name: 'ROULETTE_SELECT_CHIP',
            details: {
                chip: newChip,
            },
        })

        setChip(newChip)
    }

    async function handleBet(callback, errorCallback) {
        if (!boardChips || loading) return

        setSpinning(true)

        const boardStacks = []
        for (const [positionId, bet] of Object.entries(boardChips)) {
            boardStacks.push({
                positionId,
                chips: bet.map((b) => b.chip),
            })
        }

        const startedBetMs = window.ESCOBAR.getTime().getTime()

        let result
        try {
            result = await mutateBet({
                variables: {
                    input: {
                        boardStacks,
                    },
                },
            })

            const timeTakenMs =
                startedBetMs - window.ESCOBAR.getTime().getTime()
            let wheelStopMs = 0
            if (timeTakenMs < WHEEL_HANG_TIME_MS && rapid !== true) {
                // Mutation was 2fast2furious, add some artificial delay
                wheelStopMs =
                    WHEEL_HANG_TIME_MS -
                    (timeTakenMs - startedBetMs) -
                    window.ESCOBAR.getTime().getTime()
            }

            const landed = result?.data?.betRoulette?.result?.landedPosition
            if (landed) {
                setTimeout(() => {
                    callback?.(landed)
                    setSpinning(false)
                    setBetData(result?.data)
                }, wheelStopMs)
            } else {
                errorCallback?.()
                setSpinning(false)
            }
        } catch (err) {
            toast.add('error', 'Roulette Dealer', err.message, true)
            errorCallback?.()
            setSpinning(false)
        }
    }

    function totalPlacedOn(code) {
        const chipsOnSquare = boardChips?.[code]?.map((chip) => {
            return ROULETTE_CHIPS[chip.chip][0]
        })
        return chipsOnSquare?.reduce((a, b) => a + b, 0) ?? 0
    }

    const placedOn = {}
    Object.keys(ROULETTE_TARGETS).forEach((target) => {
        placedOn[target] = totalPlacedOn(target)
    })

    const targetPlaced = placedOn?.[hoverTarget?.code] ?? 0
    const totalPlaced = Object.values(placedOn)?.reduce((a, b) => a + b, 0) ?? 0

    const betResult = betData?.betRoulette?.result

    let wheelLanded = property.previousRouletteWinners?.[0] ?? 0
    if (betResult) {
        wheelLanded = betResult.landedPosition
    }

    return (
        <>
            <div className={`roulette-wheel`}>
                <RouletteWheel
                    rect={rect}
                    handleBet={handleBet}
                    numberLanded={wheelLanded}
                    allowBets={boardChips && totalPlaced <= property.maximumBet}
                />
            </div>
            <div className={`roulette__board`}>
                <RouletteBoardCockpit
                    totalPlaced={totalPlaced}
                    result={betResult}
                    pastResults={property.previousRouletteWinners}
                    spinning={spinning}
                />
                <RouletteBoardRewardBanner
                    chip={chip}
                    result={betResult}
                    loading={loading}
                    spinning={spinning}
                />
                {totalPlaced > property.maximumBet && (
                    <TextPill style="error">
                        Your bet of {`$${totalPlaced.toLocaleString()}`} exceeds
                        the table's maximum bet.
                    </TextPill>
                )}
                <Stage width={676} height={225} ref={boardRef}>
                    <Layer>
                        <Image
                            image={HorizontalBoard}
                            onMouseMove={handleBoardMove}
                            onTap={handleBoardMove}
                        />
                        {hoverTarget && (
                            <Rect
                                height={hoverTarget.height}
                                width={hoverTarget.width}
                                fill={`rgba(110,187,199,0.33)`}
                                x={hoverTarget.xBegin}
                                y={hoverTarget.yBegin}
                                cornerRadius={28}
                                onClick={() =>
                                    handleBoardClick(hoverTarget, chip)
                                }
                                onTap={() =>
                                    handleBoardClick(hoverTarget, chip)
                                }
                            />
                        )}
                        {Object.entries(boardChips).map(([code, chips]) =>
                            chips.map((data, indx) => (
                                <Image
                                    key={`${code}${indx}`}
                                    image={chipMap[data.chip]}
                                    x={data.x}
                                    y={data.y}
                                    height={30}
                                    width={30}
                                    offsetX={30 / 2}
                                    offsetY={30 / 2}
                                    shadowBlur={14}
                                    shadowColor={'rgba(0,0,0,0.6)'}
                                    listening={false}
                                />
                            ))
                        )}
                    </Layer>
                </Stage>
                <div
                    className={`roulette__board__info ${
                        !hoverTarget ? 'roulette__board__info__hidden' : ''
                    }`}
                >
                    <p>{hoverTarget?.name ?? '.'}</p>
                    {`$${targetPlaced?.toLocaleString()}`}
                </div>
                <RouletteBoardChips
                    chip={chip}
                    handleSelectChip={handleSelectChip}
                />
                <div className={`roulette__board__controls`}>
                    <div className={`roulette__board__controls__plane`}>
                        {/*<Button type={`primary`} color={`darkGrey`}>*/}
                        {/*    Undo*/}
                        {/*</Button>{' '}*/}
                        <Button
                            type={`primary`}
                            color={`grey`}
                            onClick={handleClear}
                        >
                            Clear
                        </Button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default RouletteBoard
