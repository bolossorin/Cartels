import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import PlayerCard from './PlayerCard.jsx'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import IntegratedLoader from '../_common/Loading/IntegratedLoader'

import './playersOnline.scss'
import Content from '../../_common/Content/Content'
import Masthead from '../../_common/Masthead/Masthead'

const ONLINE_PLAYERS = gql`
    query OnlinePlayers {
        activePlayers {
            count
            players {
                id
                name
                role
            }
        }
    }
`

function PlayersOnline() {
    const { loading, data, refetch } = useQuery(ONLINE_PLAYERS, {
        fetchPolicy: 'cache-and-network',
    })

    if (!data?.activePlayers?.players) {
        return <IntegratedLoader text={`Loading..`} />
    }

    const count = data?.activePlayers?.count
    const players = data?.activePlayers?.players

    return (
        <Content color="game" className="players-container">
            <Masthead fullWidth>{count ? count : ''} Players Online</Masthead>
            <p className="legend">Active in the last 10 minutes</p>
            <div className="players-online">
                {!players ? (
                    <b>None today</b>
                ) : (
                    players.map((players) => (
                        <PlayerCard playerOnline={players ?? null} />
                    ))
                )}
            </div>
        </Content>
    )
}

export default PlayersOnline
