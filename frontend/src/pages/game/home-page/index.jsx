import React from 'react'
import Star from 'img/login/rotating-star-centered-01.svg'
import { gql } from 'apollo-boost'
import { useQuery } from '@apollo/react-hooks'
import './HomePage.scss'
import Content from '../../_common/Content/Content'
import Image from '../../_common/Image/Image'
import JailIcon from 'img/icons/jail.svg'
import Horse from 'img/icons/Group.svg'
import Messages from 'img/icons/messages.svg'
import Cuffs from 'img/icons/surface1.svg'
import IcoMinor from 'img/icons/minor_sh.png'
import IcoCarTheft from 'img/icons/cars.png'
import Cartels from 'img/cartels_slim.png'
import NameTag from '../_common/NameTag'
import Text from '../../_common/Text/Text'
import StatsItem from '../_common/StatsItem'
import useJailFeed from '../../../hooks/useJailFeed'
import CrewTag from '../crews/CrewTag'

const VIEWER_QUERY = gql`
    query PlayerQuery {
        viewer {
            player {
                id
                name
                character
                rank
                role
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
                    crimeSuccess
                    crimeEvaded
                    crimeJailed
                    crimeLootCash
                    forumReplies
                    forumPosts
                    carTheftSuccess
                    carTheftFlawlessSuccess
                    carTheftFail
                    carTheftJailed
                }
                crew {
                    id
                    name
                    crewType
                }
            }
        }
    }
`

const STATS = [
    {
        name: 'jail',
        image: JailIcon,
        stats: [],
    },
    {
        name: 'jail escape',
        image: Cuffs,
        stats: [],
    },
    {
        name: 'Forums',
        image: Messages,
        stats: [],
    },
    // {
    //     name: 'stuff3',
    //     image: Horse,
    //     stats: [],
    // },
    {
        name: 'crimes',
        image: IcoMinor,
        stats: [],
    },
    {
        name: 'car theft',
        image: IcoCarTheft,
        stats: [],
    },
]

function HomePage() {
    const { loading, error, data, refetch } = useQuery(VIEWER_QUERY)

    const player = data?.viewer?.player

    const stats = STATS

    const jailStats = [
        {
            name: 'successful busts',
            value: player?.stats?.bustSuccess,
            color: 'blue',
        },
        {
            name: 'failed busts',
            value: player?.stats?.bustFail,
            color: 'red',
        },
        {
            name: 'total busts',
            value: player?.stats?.bustTotal,
            color: 'blue',
        },
        {
            name: 'current bust streak',
            value: player?.stats?.bustStreak,
            color: 'blue',
        },
        {
            name: 'times busted successfully',
            value: player?.stats?.bustedSuccess,
            color: 'blue',
        },
        {
            name: 'times failed bust',
            value: player?.stats?.bustedFail,
            color: 'red',
        },
    ]

    const escapeStats = [
        {
            name: 'times escaped',
            value: player?.stats?.escapeSuccess,
            color: 'blue',
        },
        {
            name: 'times escape failed',
            value: player?.stats?.escapeFail,
            color: 'red',
        },
        {
            name: 'current escapes streak',
            value: player?.stats?.escapeStreak,
            color: 'blue',
        },
        {
            name: 'best escapes streak',
            value: player?.stats?.escapeStreakMax,
            color: 'blue',
        },
    ]

    const forumStats = [
        {
            name: 'threads posted',
            value: player?.stats?.forumPosts,
            color: 'blue',
        },
        {
            name: 'replies posted',
            value: player?.stats?.forumReplies,
            color: 'blue',
        },
    ]

    const crimesStats = [
        {
            name: 'crimes succeeded',
            value: player?.stats?.crimeSuccess,
            color: 'blue',
        },
        {
            name: 'successful evasions',
            value: player?.stats?.crimeEvaded,
            color: 'red',
        },
        {
            name: 'arrests',
            value: player?.stats?.crimeEvaded,
            color: 'red',
        },
        {
            name: 'total loot',
            value: player?.stats?.crimeLootCash,
            color: 'blue',
        },
    ]

    const carTheftStats = [
        {
            name: 'car thefts succeeded',
            value: player?.stats?.carTheftSuccess,
            color: 'blue',
        },
        {
            name: 'flawless car thefts',
            value: player?.stats?.carTheftFlawlessSuccess,
            color: 'blue',
        },
        {
            name: 'car thefts failed',
            value: player?.stats?.carTheftFail,
            color: 'red',
        },
        {
            name: 'arrests from car thefts',
            value: player?.stats?.carTheftJailed,
            color: 'red',
        },
    ]

    stats[0].stats = [...jailStats]
    stats[1].stats = [...escapeStats]
    stats[2].stats = [...forumStats]
    stats[3].stats = [...crimesStats]
    stats[4].stats = [...carTheftStats]

    return (
        <Content color={`black`} className={`home-page`}>
            <div className="home-page__header">
                <div
                    className={`home-page__header__background home-page__header__background--${player?.character.toLowerCase()}`}
                />
                <div className="home-page__header__text">
                    <div className="home-page__header__text__top">
                        <NameTag player={player} />
                        <CrewTag crew={player?.crew} linkToMyCrew />
                    </div>
                    <h3 className="home-page__header__text__bottom">
                        Welcome back!
                    </h3>
                </div>
            </div>
            <div className="home-page__stats">
                {stats.map((stat) => (
                    <StatsItem
                        name={stat.name}
                        image={stat.image}
                        stats={stat.stats}
                    />
                ))}
            </div>
        </Content>
    )
}

export default HomePage
