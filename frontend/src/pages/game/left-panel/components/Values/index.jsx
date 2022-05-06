import React from 'react'
import BalanceItem from '../../../_common/BalanceItem'
import gql from 'graphql-tag'

import './Values.scss'
import { useQuery } from '@apollo/react-hooks'

const VIEWER_QUERY = gql`
    query PlayerQuery {
        viewer {
            player {
                id
                cash
                gold
                crypto
            }
        }
    }
`

function Values() {
    const { data } = useQuery(VIEWER_QUERY)
    const player = data?.viewer?.player

    return (
        <div className="balances-container">
            {player && (
                <>
                    <BalanceItem
                        value={player?.cash ?? 0}
                        currency={'cash'}
                        showFull
                    />
                    <BalanceItem
                        value={player?.crypto ?? 0}
                        currency={'crypto'}
                        showFull
                    />
                    <BalanceItem
                        value={player?.gold ?? 0}
                        currency={'gold'}
                        showFull
                    />
                </>
            )}
        </div>
    )
}

export default Values
