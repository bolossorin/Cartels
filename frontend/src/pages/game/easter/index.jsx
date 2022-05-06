import React, { useEffect, useState } from 'react'
import Content from '../../_common/Content/Content'
import useSound from 'use-sound'

import Combine from 'assets/images/easter/combine.webm'
import CombineSound from 'assets/images/easter/combine.mp3'

import { gql } from 'apollo-boost'
import { useMutation, useQuery } from '@apollo/react-hooks'
import FullScreenLoader from '../_common/Loading/FullScreenLoader'
import { useToast } from '../_common/Toast'

import './Easter.scss'
import { PLAYER_ITEMS_QUERY } from '../left-panel/components/Inventory/InventoryGrid'
import StatsItem from '../_common/StatsItem'

const EASTER_QUERY = gql`
    query EggCombinatorQuery {
        viewer {
            player {
                id
            }
        }
        events {
            easter {
                active
                eggs {
                    ord
                    quantity
                }
                stats {
                    name
                    image
                    items {
                        name
                        color
                        value
                    }
                }
            }
        }
    }
`

const EASTER_MUTATION = gql`
    mutation EggCombinatorMutation {
        useEggcombinator
    }
`

function Easter() {
    const toast = useToast()
    const { data, loading } = useQuery(EASTER_QUERY)
    const [mutateEgg] = useMutation(EASTER_MUTATION)
    const [combining, setCombining] = useState(false)
    const [mutated, setMutated] = useState(false)
    const [play] = useSound(CombineSound)

    useEffect(() => {
        if (combining) {
            play()
        }
    }, [combining])

    if (loading) {
        return <FullScreenLoader />
    }

    async function combine() {
        setCombining(true)

        const { data } = await mutateEgg({
            refetchQueries: [
                { query: EASTER_QUERY },
                { query: PLAYER_ITEMS_QUERY },
            ],
        })
        if (data?.useEggcombinator === true) {
            setTimeout(() => {
                toast.add(
                    'success',
                    'Eggcombinator',
                    `You have been awarded 1 Golden Easter Egg`,
                    true
                )
                setMutated(true)
            }, 2000)
            setTimeout(() => {
                setMutated(false)
            }, 6000)
        } else {
            toast.add(
                'error',
                'Eggcombinator',
                `Could not combine eggs. Try refreshing the page.`
            )
        }

        setTimeout(() => {
            setCombining(false)
        }, 4000)
    }

    const eggs = data?.events?.easter?.eggs
    const stats = data?.events?.easter?.stats
    const hasEggs = []
    if (eggs) {
        for (const { ord, quantity } of eggs) {
            if (quantity >= 1) {
                hasEggs.push(ord)
            }
        }
    }
    const isReady = hasEggs?.length === 6
    const isActive = data?.events?.easter?.active ?? false

    let statusText = 'Click to combine'
    if (hasEggs?.length !== 6) {
        const remaining = 6 - (hasEggs?.length ?? 0)
        statusText = `Collect ${remaining} more egg${
            remaining !== 1 ? `s` : ''
        }`
    }

    const carTheftStats = [
        {
            name: 'car thefts succeeded',
            value: 15,
            color: 'blue',
        },
    ]

    return (
        <Content color="game" className="easter">
            <div className="easter__top-background">
                <div className="easter__machine">
                    {combining ? (
                        <div className="easter__machine__video">
                            <video autoPlay={true}>
                                <source src={Combine} type="video/webm" />
                            </video>
                        </div>
                    ) : (
                        <div
                            className={`easter__machine__${
                                isActive ? 'base' : 'inactive'
                            } easter__machine__base__${
                                isReady ? 'ready' : 'not-ready'
                            }`}
                            onClick={isReady ? combine : undefined}
                        >
                            &nbsp;
                        </div>
                    )}
                    {hasEggs?.map((egg) => {
                        return (
                            <div
                                className={`easter__machine__egg${egg}`}
                                key={egg}
                            >
                                &nbsp;
                            </div>
                        )
                    })}
                    {mutated && (
                        <div className="easter__machine__win">
                            <img
                                src={
                                    'https://d3ve641rnt81e8.cloudfront.net/static/items/assets/eggs/egg_7.png'
                                }
                                width={50}
                                height={50}
                                alt={'Enjoy a free Golden Egg!'}
                            />
                        </div>
                    )}
                </div>
                {isActive && !combining && !mutated && (
                    <div className="easter__status">{statusText}</div>
                )}
                <div className="easter__preload">
                    test
                    <video autoPlay={true} width="1" height="1">
                        <source src={Combine} type="video/webm" />
                    </video>
                    <div className="easter__machine__base">&nbsp;</div>
                    <div className="easter__machine__ready">&nbsp;</div>
                    <div className="easter__machine__egg1">&nbsp;</div>
                    <div className="easter__machine__egg2">&nbsp;</div>
                    <div className="easter__machine__egg3">&nbsp;</div>
                    <div className="easter__machine__egg4">&nbsp;</div>
                    <div className="easter__machine__egg5">&nbsp;</div>
                    <div className="easter__machine__egg6">&nbsp;</div>
                    <img
                        src={
                            'https://d3ve641rnt81e8.cloudfront.net/static/items/assets/eggs/egg_7.png'
                        }
                        width={1}
                        height={1}
                        alt={'Golden Easter Egg!'}
                    />
                </div>
                {stats?.map((stat) => (
                    <StatsItem
                        name={stat.name}
                        image={stat.image}
                        stats={stat.items}
                    />
                ))}
            </div>
        </Content>
    )
}

export default Easter
