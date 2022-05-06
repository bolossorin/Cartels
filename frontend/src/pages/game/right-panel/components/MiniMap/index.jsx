import React from 'react'
import Content from '../../../../_common/Content/Content'
import Pin from 'img/map/mini-pin.svg'

import './MiniMap.scss'
import Image from '../../../../_common/Image/Image'
import { Link } from 'react-router-dom'
import { gql } from 'apollo-boost'
import { useQuery } from '@apollo/react-hooks'

const LOCATION_QUERY = gql`
    query PlayerMiniMapQuery {
        viewer {
            player {
                id
                district
            }
        }
        jail {
            inmatesCount
        }
        activePlayers {
            count
        }
    }
`

function MiniMap() {
    const { data } = useQuery(LOCATION_QUERY, {
        pollInterval: 25000,
    })
    const location = data?.viewer?.player?.district;
    const locationInitials = location
        ? location.match(/[A-Z]/g).join('').toLowerCase()
        : 'vh';
    const inmates = data?.jail?.inmatesCount;
    const activePlayers = data?.activePlayers?.count;

    return (
        <>
            <Content
                color="black"
                className={`mini-map mini-map__${locationInitials}`}
            >
                <Link to={`/map`}>
                    <p>{location}</p>
                    <Image src={Pin} alt={location} />
                </Link>
                <ul className={`mini-map__pills`}>
                    <Link to={`/online`}>
                        <li
                            className={`mini-map__pills__item mini-map__pills__item__black`}
                        >
                            {activePlayers} online
                        </li>
                    </Link>

                    <Link to={`/jail`}>
                        <li
                            className={`mini-map__pills__item mini-map__pills__item__${
                                inmates > 0 ? 'red' : 'black'
                            }`}
                        >
                            {inmates} in Jail
                        </li>
                    </Link>
                </ul>
            </Content>
        </>
    )
}

export default MiniMap
