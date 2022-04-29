import React, { useMemo, useCallback } from 'react'
import { AreaClosed, Line, Bar, LinePath } from '@visx/shape'
import appleStock, { AppleStock } from '@visx/mock-data/lib/mocks/appleStock'
import { curveMonotoneX } from '@visx/curve'
import { GridRows, GridColumns } from '@visx/grid'
import { scaleTime, scaleLinear } from '@visx/scale'
import {
    withTooltip,
    Tooltip,
    TooltipWithBounds,
    defaultStyles,
} from '@visx/tooltip'
import { WithTooltipProvidedProps } from '@visx/tooltip/lib/enhancers/withTooltip'
import { localPoint } from '@visx/event'
import { LinearGradient } from '@visx/gradient'
import { max, extent, bisector } from 'd3-array'
import { timeFormat } from 'd3-time-format'
import { Text } from '@visx/text'

const stock = appleStock.slice(200)
export const background = '#ff0000'
export const background2 = '#204051'
export const accentColor = '#da414155'
export const accentColorDark = 'transparent'
const tooltipStyles = {
    ...defaultStyles,
    background: '#00000055',
    border: '1px solid #ffffff55',
    color: 'white',
}

// util
const formatDate = timeFormat("%b %d, '%y")

// accessors
const getDate = (d) => new Date(d.date)
const getStockValue = (d) => d.close
const bisectDate = bisector((d) => new Date(d.date)).left

export default withTooltip(
    ({
        width,
        height,
        margin = { top: 0, right: 0, bottom: 0, left: 0 },
        showTooltip,
        hideTooltip,
        tooltipData,
        tooltipTop = 0,
        tooltipLeft = 0,
    }) => {
        if (width < 10) return null

        // bounds
        const innerWidth = width - margin.left - margin.right
        const innerHeight = height - margin.top - margin.bottom

        // scales
        const dateScale = useMemo(
            () =>
                scaleTime({
                    range: [margin.left, innerWidth + margin.left],
                    domain: extent(stock, getDate),
                }),
            [innerWidth, margin.left]
        )
        const stockValueScale = useMemo(
            () =>
                scaleLinear({
                    range: [innerHeight + margin.top, margin.top],
                    domain: [
                        0,
                        (max(stock, getStockValue) || 0) + innerHeight / 3,
                    ],
                    nice: true,
                }),
            [margin.top, innerHeight]
        )

        // tooltip handler
        const handleTooltip = useCallback(
            (event) => {
                const { x } = localPoint(event) || { x: 0 }
                const x0 = dateScale.invert(x)
                const index = bisectDate(stock, x0, 1)
                const d0 = stock[index - 1]
                const d1 = stock[index]
                let d = d0
                if (d1 && getDate(d1)) {
                    d =
                        x0.valueOf() - getDate(d0).valueOf() >
                        getDate(d1).valueOf() - x0.valueOf()
                            ? d1
                            : d0
                }
                showTooltip({
                    tooltipData: d,
                    tooltipLeft: x,
                    tooltipTop: stockValueScale(getStockValue(d)),
                })
            },
            [showTooltip, stockValueScale, dateScale]
        )

        return (
            <div>
                <svg width={width} height={height}>
                    <rect
                        x={0}
                        y={0}
                        width={width}
                        height={height}
                        fill="url(#area-background-gradient)"
                        rx={14}
                    />
                    <LinearGradient
                        id="area-gradient"
                        from={accentColor}
                        to={accentColor}
                        toOpacity={0.01}
                    />
                    <LinearGradient
                        id="stroke-gradient"
                        from={`cyan`}
                        to={`transparent`}
                        fromOffset={`99%`}
                        toOpacity={0.01}
                    />
                    <LinearGradient
                        id="text-gradient"
                        from={`#d31813`}
                        to={`#d31813`}
                        toOpacity={1}
                    />
                    <GridRows
                        left={margin.left}
                        scale={stockValueScale}
                        width={innerWidth}
                        strokeDasharray="4"
                        stroke={`#00000022`}
                        strokeOpacity={1}
                        pointerEvents="none"
                    />
                    <LinePath
                        data={stock}
                        x={(d) => dateScale(getDate(d)) ?? 0}
                        y={(d) => stockValueScale(getStockValue(d)) ?? 0}
                        yScale={stockValueScale}
                        strokeWidth={2}
                        stroke="#d3181399"
                        strokeLinejoin="round"
                        strokeLinecap="butt"
                        fill="transparent"
                        curve={curveMonotoneX}
                    />
                    <AreaClosed
                        data={stock}
                        x={(d) => dateScale(getDate(d)) ?? 0}
                        y={(d) => stockValueScale(getStockValue(d)) ?? 0}
                        yScale={stockValueScale}
                        fill="url(#area-gradient)"
                        curve={curveMonotoneX}
                    />
                    <Bar
                        x={margin.left}
                        y={margin.top}
                        width={innerWidth}
                        height={innerHeight}
                        fill="transparent"
                        rx={14}
                        onTouchStart={handleTooltip}
                        onTouchMove={handleTooltip}
                        onMouseMove={handleTooltip}
                        onMouseLeave={() => hideTooltip()}
                    />
                    {tooltipData && (
                        <g>
                            <Line
                                from={{ x: tooltipLeft, y: margin.top }}
                                to={{
                                    x: tooltipLeft,
                                    y: innerHeight + margin.top,
                                }}
                                stroke={`#000000aa`}
                                strokeWidth={2}
                                pointerEvents="none"
                                strokeDasharray="5,2"
                            />
                            <circle
                                cx={tooltipLeft}
                                cy={tooltipTop + 1}
                                r={4}
                                fill="black"
                                fillOpacity={0.1}
                                stroke="black"
                                strokeOpacity={0.1}
                                strokeWidth={2}
                                pointerEvents="none"
                            />
                            <circle
                                cx={tooltipLeft}
                                cy={tooltipTop}
                                r={4}
                                fill={accentColorDark}
                                stroke="#ffffffaa"
                                strokeWidth={2}
                                pointerEvents="none"
                            />
                        </g>
                    )}
                    <Text
                        verticalAnchor="start"
                        x={15}
                        y={15}
                        style={{
                            fontSize: '16px',
                        }}
                        fill={`#ffffffde`}
                    >
                        Crime operations:
                    </Text>
                    <Text
                        verticalAnchor="start"
                        x={133}
                        y={12}
                        style={{
                            color: '#ff0000',
                            fontSize: '24px',
                        }}
                        fill={`url(#text-gradient)`}
                    >
                        1,378
                    </Text>
                </svg>
                {tooltipData && (
                    <div>
                        <TooltipWithBounds
                            key={Math.random()}
                            top={tooltipTop - 12}
                            left={tooltipLeft + 12}
                            style={tooltipStyles}
                        >
                            {`${parseInt(getStockValue(tooltipData))}`}
                        </TooltipWithBounds>
                        <Tooltip
                            top={innerHeight + margin.top - 1}
                            left={tooltipLeft}
                            style={{
                                ...tooltipStyles,
                                minWidth: 100,
                                textAlign: 'center',
                                transform: 'translateX(-50%)',
                            }}
                        >
                            {formatDate(getDate(tooltipData))}
                        </Tooltip>
                    </div>
                )}
            </div>
        )
    }
)
