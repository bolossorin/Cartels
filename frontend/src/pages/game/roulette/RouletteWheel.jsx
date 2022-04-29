import React, { useState } from 'react'
import WheelCanvas from 'assets/images/roulette/wheel.svg'

import './Roulette.scss'
import { Image, Layer, Rect, Stage, Text } from 'react-konva'
import IntegratedLoader from '../_common/Loading/IntegratedLoader'
import useImage from 'use-image'
import { animated } from '@react-spring/konva'
import { useSpring, config } from 'react-spring'

function generateWheelPosition({
    contentWidth,
    width,
    height,
    spinning,
    rotation,
}) {
    return {
        x: contentWidth / 2,
        y: spinning ? 250 : 160,
        width: width,
        height: height,
        rotation: rotation ?? 0,
        offsetX: width / 2,
        offsetY: height / 2,
        opacity: spinning ? 1 : 0.6,
    }
}

function ThemedRect({ wheelDefault, width, height, handleBet, allowBets }) {
    const [image] = useImage(WheelCanvas)
    const [flag, setFlag] = useState(undefined)
    const [styles, api] = useSpring(() => wheelDefault)
    const [{ opacity }, textApi] = useSpring(() => ({ opacity: 1 }))

    function handleClick() {
        if (!allowBets) return
        if (flag === undefined) {
            const pos = generateWheelPosition({
                contentWidth: width,
                width: 385,
                height: 385,
                spinning: true,
            })
            textApi.start({ opacity: 0 })
            api.update({
                from: { ...styles, rotation: 0 },
                to: { ...pos, rotation: 360 },
                loop: true,
                config: { duration: 1500 },
            })
            api.start()
            setFlag(1)
            handleBet(
                (landed) => {
                    api.stop()
                    const pos = generateWheelPosition({
                        contentWidth: width,
                        width: 385,
                        height: 385,
                        spinning: true,
                        rotation: getRotationByLandedNumber(parseInt(landed)),
                    })
                    api.update({
                        to: {
                            ...pos,
                        },
                        config: { ...config.gentle },
                    })
                    api.start()
                    setFlag(undefined)
                },
                () => {
                    api.stop()
                    setFlag(undefined)
                }
            )
        }
    }

    return (
        <>
            <animated.Image
                {...wheelDefault}
                {...styles}
                image={image}
                onClick={() => handleClick()}
                onTouchStart={() => handleClick()}
            />
            <animated.Text
                text={`SPIN`}
                fill={`#ffffff`}
                fontFamily={`'FuturaBold', sans-serif`}
                fontSize={36}
                opacity={opacity}
                align="center"
                width={width}
                y={height - 46}
                onClick={() => handleClick()}
                onTouchStart={() => handleClick()}
            />
        </>
    )
}

const LANDED_NUMBER_ROTATION_MAP = [
    0,
    32,
    15,
    19,
    4,
    21,
    2,
    25,
    17,
    34,
    6,
    27,
    13,
    36,
    11,
    30,
    8,
    23,
    10,
    5,
    24,
    16,
    33,
    1,
    20,
    14,
    31,
    9,
    22,
    18,
    29,
    7,
    28,
    12,
    35,
    3,
    26,
]

function getRotationByLandedNumber(number) {
    const pos = LANDED_NUMBER_ROTATION_MAP.findIndex((x) => x === number)

    return pos ? pos * 9.75 * -1 : 0
}

function RouletteWheel({ rect, handleBet, numberLanded, allowBets }) {
    const contentWidth = rect?.width
    const contentHeight = rect?.height

    if (!rect || !contentWidth || !contentHeight) {
        return <IntegratedLoader />
    }
    const rotation = getRotationByLandedNumber(numberLanded)
    const wheelDefault = generateWheelPosition({
        width: 300,
        height: 300,
        rotation,
        contentWidth,
    })

    return (
        <div className={`wheelly`}>
            <Stage width={contentWidth} height={150}>
                <Layer>
                    <ThemedRect
                        width={contentWidth}
                        height={150}
                        wheelDefault={wheelDefault}
                        handleBet={handleBet}
                        allowBets={allowBets}
                    />
                </Layer>
            </Stage>
        </div>
    )
}

export default RouletteWheel
