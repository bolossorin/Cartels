import React, { useEffect, useState } from 'react'

import './Jail.scss'

import { gql } from 'apollo-boost'
import { useSubscription } from '@apollo/react-hooks'
import NameTag from '../_common/NameTag'

const JAIL_BUST_FEED_MUTATION = gql`
    subscription jailBustFeed {
        jailBustFeed {
            crime
            buster {
                id
                name
                rank
                character
                role
            }
            inmate {
                id
                name
                rank
                character
                role
            }
            date
        }
    }
`

function BustFeed() {
    const [recentBusts, setRecentBusts] = useState([])
    const { data } = useSubscription(JAIL_BUST_FEED_MUTATION)

    useEffect(() => {
        const jailBust = data?.jailBustFeed
        if (jailBust) {
            const updatedRecentBusts = [
                ...recentBusts,
                {
                    ...jailBust,
                },
            ]
            setRecentBusts(updatedRecentBusts.slice(-3))
        }
    }, [data])

    return (
        <div className={`jail__recent`}>
            {recentBusts?.map(({ buster, inmate, crime, date }) => {
                return (
                    <div
                        className={`jail__recent__bust`}
                        key={`${date}${buster.id}${inmate.id}`}
                    >
                        <NameTag player={buster} /> busted{' '}
                        <NameTag player={inmate} />
                    </div>
                )
            })}
        </div>
    )
}

export default React.memo(BustFeed)
