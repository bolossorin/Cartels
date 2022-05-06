import React, { useState } from 'react'

import './Perks.scss'
import Content from '../../_common/Content/Content'
import Image from '../../_common/Image/Image'
import Arrow from 'assets/images/arrow.svg'

import DemoPerk from 'assets/items/assets/drill_portable/drill_portable_render_1.png'
import DemoPerk2 from 'assets/items/assets/blackhat_pda/blackhat_pda_render_1.png'
import ActivePerk from './ActivePerk'
import { Link } from 'react-router-dom'
import { gql } from 'apollo-boost'
import { useQuery } from '@apollo/react-hooks'

const PERKS_QUERY = gql`
    query PerksSidebarQuery {
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

function Perks() {
    const { data } = useQuery(PERKS_QUERY, {
        pollInterval: 30000,
    })

    const perks = data?.activePerks

    return (
        <>
            {perks?.length >= 1 && (
                <Link to={`/perks`}>
                    <Content color="game" className={`perks-bar`}>
                        <div className={`perks-bar__title`}>
                            Perks
                            <div className={`perks-bar__title__arrow`}>
                                <Image src={Arrow} alt={`Open active perks`} />
                            </div>
                        </div>
                        <div className={`perks-bar__content`}>
                            {perks?.map((perk) => {
                                return <ActivePerk perk={perk} />
                            })}
                        </div>
                    </Content>
                </Link>
            )}
        </>
    )
}

export default React.memo(Perks)
