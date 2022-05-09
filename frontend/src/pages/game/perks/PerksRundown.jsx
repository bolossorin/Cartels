import React from 'react'
import Content from '../../_common/Content/Content'
import Masthead from '../../_common/Masthead/Masthead'
import './PerksRundown.scss'
import ActivePerk from './ActivePerk'
import Global from 'assets/images/public/favicon/favicon512.png'
import DemoPerk from 'assets/items/assets/gift_box/gift_box_render_1.png'
import DemoPerk2 from 'assets/items/assets/blackhat_pda/blackhat_pda_render_1.png'
import { gql } from 'apollo-boost'
import { useQuery } from '@apollo/react-hooks'

const PERKS_QUERY = gql`
    query PerksPageQuery {
        activePerks {
            id
            name
            description
            imageUrl
            global
            startedAt
            expiresAt
            createdAt
        }
    }
`

function PerksRundown() {
    const { data } = useQuery(PERKS_QUERY, {
        fetchPolicy: 'cache-and-network',
    })

    const perks = data?.activePerks

    return (
        <>
            <Content color="game">
                <Masthead fullWidth>Perks</Masthead>
                <div className={`perks-rundown__list`}>
                    {perks?.map((perk) => {
                        return (
                            <div
                                className={`perks-rundown__list__row ${
                                    perk?.global
                                        ? `perks-rundown__list__row__global`
                                        : ''
                                }`}
                                key={perk.id}
                            >
                                <div
                                    className={`perks-rundown__list__row__icon`}
                                >
                                    <ActivePerk perk={perk} />
                                </div>
                                <div
                                    className={`perks-rundown__list__row__description`}
                                >
                                    <div
                                        className={`perks-rundown__list__row__description__title`}
                                    >
                                        {perk.name}
                                    </div>
                                    <div
                                        className={`perks-rundown__list__row__description__content`}
                                    >
                                        {perk.description}
                                        {perk?.global && (
                                            <p className={`global-perk`}>
                                                Applied by a global game event
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </Content>
        </>
    )
}

export default PerksRundown
