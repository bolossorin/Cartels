import React from 'react'
import { Link } from 'react-router-dom'
import GambleBackground from 'img/gamble/gamble-background.png'

import './Gamble.scss'
import Masthead from '../../_common/Masthead/Masthead'
import Content from '../../_common/Content/Content'
import Button from '../../_common/Button'
import GambleCell from './gambleCell'
import { gql } from 'apollo-boost'
import { useQuery } from '@apollo/react-hooks'
import TextPill from '../_common/TextPill'

const HIGH_ROLLERS = [
    {
        player: {
            name: 'FunnyHair_1992',
            role: 'player',
        },
        game: 'Roulette',
        amount: 123243400,
    },
    {
        player: {
            name: 'FunnyHair_1994',
            role: 'moderator',
        },
        game: 'Roulette',
        amount: 12323400,
    },
    {
        player: {
            name: 'FunnyHair_1992',
            role: 'player',
        },
        game: 'Roulette',
        amount: 1243400,
    },
]

const PROPERTY_LIST_QUERY = gql`
    query PropertyCentralQuery {
        viewer {
            player {
                id
                district
            }
        }
        properties {
            list {
                id
                propertyType
                currentState
                districtName
                player {
                    id
                    name
                }
                maximumBet
            }
        }
    }
`

const LOCATIONS = [
    'Marshall City',
    'Valencia Hills',
    'Dirtlands',
    'Sol Furioso',
    'Park City',
]

function Gamble() {
    const { data } = useQuery(PROPERTY_LIST_QUERY, {
        fetchPolicy: 'cache-and-network',
    })
    const properties = data?.properties?.list
    const propertiesByType = {}
    if (properties) {
        for (const property of properties) {
            if (property.propertyType in propertiesByType) {
                propertiesByType[property.propertyType].push(property)
            } else {
                propertiesByType[property.propertyType] = [property]
            }
        }
    }

    return (
        <Content className="gamble" color="game">
            <Masthead fullWidth>Casino</Masthead>
            <img className="background" src={GambleBackground} alt="Casino" />
            <div className="gamble__list">
                {properties &&
                    Object.keys(propertiesByType).map((propertyType) => (
                        <Button
                            key={propertyType}
                            className="gamble__list__item"
                            styleType="secondary"
                            color="white"
                        >
                            <Link to={`casino/${propertyType}`}>
                                <h3>{propertyType}</h3>
                                {/*<p>{`$1,000 max`}</p>*/}
                            </Link>
                        </Button>
                    ))}
            </div>
            <TextPill style="info">
                Roulette is currently unoptimized for mobile devices. This will
                be resolved soon.
            </TextPill>
            {properties && (
                <div className="gamble__table">
                    <h3>Properties</h3>
                    <table>
                        <tr className="locations">
                            <td />
                            {LOCATIONS.map((location) => (
                                <td>{location}</td>
                            ))}
                        </tr>
                        {Object.entries(propertiesByType).map(
                            ([propertyType, properties]) => {
                                properties.sort((a, b) => {
                                    return (
                                        LOCATIONS.find(
                                            (x) => x === a.districtName
                                        ) -
                                        LOCATIONS.find(
                                            (x) => x === b.districtName
                                        )
                                    )
                                })

                                return (
                                    <tr>
                                        <td>{propertyType}</td>
                                        {properties.map((property) => (
                                            <GambleCell
                                                key={property.id}
                                                property={property}
                                            />
                                        ))}
                                    </tr>
                                )
                            }
                        )}
                        {/*<tr>*/}
                        {/*    <td>Roulette</td>*/}
                        {/*    {GAMBLE_TABLE.filter(*/}
                        {/*        (item) => item.game === 'Roulette'*/}
                        {/*    ).map(({ location, owner, maxBet, game }) => (*/}
                        {/*        <GambleCell*/}
                        {/*            key={`${location}-${game}`}*/}
                        {/*            owner={owner}*/}
                        {/*            maxBet={maxBet}*/}
                        {/*        />*/}
                        {/*    ))}*/}
                        {/*</tr>*/}
                        {/*<tr>*/}
                        {/*    <td>Blackjack</td>*/}
                        {/*    {GAMBLE_TABLE.filter(*/}
                        {/*        (item) => item.game === 'blackjack'*/}
                        {/*    ).map(({ location, owner, maxBet, game }) => (*/}
                        {/*        <GambleCell*/}
                        {/*            key={`${location}-${game}`}*/}
                        {/*            owner={owner}*/}
                        {/*            maxBet={maxBet}*/}
                        {/*        />*/}
                        {/*    ))}*/}
                        {/*</tr>*/}
                        {/*<tr>*/}
                        {/*    <td>Track</td>*/}
                        {/*    {GAMBLE_TABLE.filter(*/}
                        {/*        (item) => item.game === 'Race Track'*/}
                        {/*    ).map(({ location, owner, maxBet, game }) => (*/}
                        {/*        <GambleCell*/}
                        {/*            key={`${location}-${game}`}*/}
                        {/*            owner={owner}*/}
                        {/*            maxBet={maxBet}*/}
                        {/*        />*/}
                        {/*    ))}*/}
                        {/*</tr>*/}
                    </table>
                </div>
            )}
            {/*<Tabs*/}
            {/*    name="gambleTab"*/}
            {/*    defaultTab={localStorage.getItem('gambleTab')}*/}
            {/*>*/}
            {/*    <Masthead>High rollers</Masthead>*/}
            {/*    <Tab name="Biggest win">*/}
            {/*        {HIGH_ROLLERS.map(({ player, game, amount }, k) => (*/}
            {/*            <div className="high-rollers-item" key={k}>*/}
            {/*                <span>{k + 1}</span>*/}
            {/*                <img*/}
            {/*                    src={NoAvatar}*/}
            {/*                    alt={`${player.name}'s avatar`}*/}
            {/*                />*/}
            {/*                <div className="high-rollers-item__text">*/}
            {/*                    <NameTag player={player} />*/}
            {/*                    <div className="high-rollers-item__text__info">*/}
            {/*                        <span>{`$${Numerals(amount).format(*/}
            {/*                            '0,0',*/}
            {/*                            Math.floor*/}
            {/*                        )}`}</span>*/}
            {/*                        {` in ${game}`}*/}
            {/*                    </div>*/}
            {/*                </div>*/}
            {/*            </div>*/}
            {/*        ))}*/}
            {/*    </Tab>*/}
            {/*    <Tab name="Biggest loss">blank</Tab>*/}
            {/*    <Tab name="Lifetime">blank</Tab>*/}
            {/*</Tabs>*/}
        </Content>
    )
}

export default Gamble
