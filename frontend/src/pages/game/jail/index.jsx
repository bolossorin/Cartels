import React, { useEffect, useState } from 'react'
import Inmate from './Inmate'
import JailBackground from 'img/jail/Background.png'
import Content from '../../_common/Content/Content'
import BlueStar from 'img/jail/Star-blue.svg'
import YellowStar from 'img/jail/Star-yellow.svg'
import RedStar from 'img/jail/Star-red.svg'

import './Jail.scss'
import Masthead from '../../_common/Masthead/Masthead'
import NameTag from '../_common/NameTag'
import JailChampion from './champion'
import JailStats from './stats'
import useJailFeed from '../../../hooks/useJailFeed'
import { gql } from 'apollo-boost'
import { useMutation } from '@apollo/react-hooks'
import { useToast } from '../../game/_common/Toast'
import IntegratedLoader from '../_common/Loading/IntegratedLoader'
import BustFeed from './BustFeed'

const BUST_PLAYER_MUTATION = gql`
    mutation bustPlayerFromJail($inmateId: ID!) {
        bustPlayer(inmateId: $inmateId) {
            success
            message
            jailed
            player {
                id
                stats {
                    bustSuccess
                    bustFail
                    bustTotal
                    bustStreak
                    bustStreakMax
                    bustedSuccess
                    bustedFail
                    escapeSuccess
                    escapeFail
                    escapeStreak
                    escapeStreakMax
                }
                isJailed
                xp
                xpTarget
                role
            }
            progression {
                id
                level
                progress
                progressMin
                progressTarget
            }
        }
    }
`

function JailPage() {
    const toast = useToast()
    const { inmates } = useJailFeed()
    const [mutateBust, { data, loading }] = useMutation(BUST_PLAYER_MUTATION)

    const bustResult = data?.bustPlayer

    useEffect(() => {
        if (bustResult) {
            const { success, message } = bustResult

            toast.add(success ? 'success' : 'failed', 'Jail', message, true)
        }
    }, [bustResult])

    function handleBust(inmate) {
        mutateBust({
            variables: {
                inmateId: inmate.id,
            },
        })
    }

    return (
        <Content className="jail" color="game">
            <Masthead fullWidth>Jail</Masthead>
            <BustFeed />
            <img className="background" src={JailBackground} alt="Jail" />
            {!inmates && <IntegratedLoader />}
            <div className="inmates-list">
                {inmates?.map((inmate) => (
                    <Inmate
                        key={inmate.id}
                        inmate={inmate}
                        disabled={loading}
                        loading={loading}
                        handleBust={handleBust}
                    />
                ))}
                {!inmates ||
                    (inmates.length === 0 && (
                        <div className={`inmates-list__empty`}>
                            Jail is currently empty
                        </div>
                    ))}
            </div>
            {/*<span className="subtitle">BUST CHAMPION</span>*/}
            {/*<JailChampion />*/}
            <span className="subtitle">YOUR JAIL STATS</span>
            <JailStats />
            <span className="subtitle">Legend and info</span>
            <div className="jail__legend">
                <div className="jail__legend__item">
                    <img src={BlueStar} alt="blue star" />
                    <p>Minimum Security</p>
                </div>
                <div className="jail__legend__item">
                    <img src={YellowStar} alt="yellow star" />
                    <p>Medium Security</p>
                </div>
                <div className="jail__legend__item">
                    <img src={RedStar} alt="red star" />
                    <p>Maximum Security</p>
                </div>
            </div>
        </Content>
    )
}

export default JailPage
