import React, { useState } from 'react'
import './Crews.scss'
import Content from '../../_common/Content/Content'
import Masthead from '../../_common/Masthead/Masthead'
import { gql } from 'apollo-boost'
import { useQuery } from '@apollo/react-hooks'
import { PLAYER_ITEMS_QUERY } from '../left-panel/components/Inventory/InventoryGrid'
import CrewItem from './CrewItem'
import CrewsBackground from 'img/crew/image 13.png'
import { useParams } from 'react-router'
import Back from 'img/icons/back.svg'
import { Link } from 'react-router-dom'
import Tabs from './Tabs'
import Bio from './Bio'
import Application from './Application'
import Hierarchy from './Hierarchy'
import CrewsHeader from './CrewsHeader'

const CREW_QUERY = gql`
    query crew($input: CrewInput!) {
        crew(input: $input) {
            id
            name
            image
            crewType
            influence
            bio
            applications
            applicationQuestions
            selfApplication
            members {
                id
                name
                role
            }
            hierarchy {
                tier1 {
                    id
                    name
                    role
                }
                tier2 {
                    id
                    name
                    role
                }
                tier3 {
                    id
                    name
                    role
                }
            }
        }
    }
`

const TABS = [
    {
        name: 'Bio',
        url: '',
    },
    {
        name: 'Hierarchy',
        url: 'hierarchy',
    },
    {
        name: 'Application',
        url: 'application',
    },
]

function Crew() {
    const { id, tab } = useParams()

    const { data } = useQuery(CREW_QUERY, {
        variables: {
            input: {
                id: id,
            },
        },
    })

    const crew = data?.crew

    return (
        <CrewsHeader
            title="Crews"
            linkTo="/crews-list"
            linkButton={{ url: '/crews-list', text: 'Crews list' }}
        >
            <div className="crew-page">
                <CrewItem crew={crew} />
                <Tabs
                    currentTab={tab}
                    tabs={TABS}
                    firstPartLink={`/crew/${crew?.id}`}
                />
                <div className="crew-content">
                    {!tab && <Bio bio={crew?.bio} />}
                    {tab === 'application' && <Application crew={crew} />}
                    {tab === 'hierarchy' && <Hierarchy crew={crew} />}
                </div>
            </div>
        </CrewsHeader>
    )
}

export default Crew
