import React from 'react'
import { Link } from 'react-router-dom'

import './RightNavLinks.scss'
import { gql } from 'apollo-boost'
import { useQuery } from '@apollo/react-hooks'

const NAV_QUERY = gql`
    query NavQuery {
        jail {
            inmatesCount
        }
        activePlayers {
            count
        }
    }
`

function RightNavLinks() {
    const { data } = useQuery(NAV_QUERY, {
        fetchPolicy: 'network-only',
        pollInterval: 30000,
    })

    const jailCount = data?.jail?.inmatesCount
    const onlineCount = data?.activePlayers?.count

    return (
        <div className="game-nav content-box">
            <nav>
                <ul>
                    <li>
                        <Link to="/jail">
                            Jail <span>{jailCount ?? 'N/A'}</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/online">
                            Players Online <span>{onlineCount ?? 'N/A'}</span>
                        </Link>
                    </li>
                    {/*<li>*/}
                    {/*    <Link to="/referrals">Referrals</Link>*/}
                    {/*</li>*/}
                    {/*<li>*/}
                    {/*    <Link to="/support-us">Support us</Link>*/}
                    {/*</li>*/}
                    <li>
                        <Link to="/updates">Updates</Link>
                    </li>
                    <li>
                        <Link to="/rules">Rules and privacy policy</Link>
                    </li>
                </ul>
            </nav>
        </div>
    )
}

export default RightNavLinks
