import React, { useState } from 'react'
import './Crews.scss'
import Content from '../../_common/Content/Content'
import Masthead from '../../_common/Masthead/Masthead'
import { gql } from 'apollo-boost'
import { useQuery } from '@apollo/react-hooks'
import { PLAYER_ITEMS_QUERY } from '../left-panel/components/Inventory/InventoryGrid'
import CrewItem from './CrewItem'
import CrewsBackground from 'img/crew/image 13.png'
import { Link } from 'react-router-dom'
import Button from '../../_common/Button'
import CrewsHeader from './CrewsHeader'

const CREWS_QUERY = gql`
    query crews {
        crews {
            createAvailability
            maximumCrews
            crewsLimitCount
            crews {
                id
                name
                image
                influence
                crewType
                members {
                    id
                    name
                }
            }
        }
    }
`

function CrewsList() {
    const { data } = useQuery(CREWS_QUERY)
    const crewsList = data?.crews?.crews
    const maximumCrews = data?.crews?.maximumCrews
    const crewsLimitCount = data?.crews?.crewsLimitCount
    const createAvailability =
        data?.crews?.createAvailability && crewsLimitCount < maximumCrews

    return (
        <CrewsHeader
            title="Crews"
            linkTo="/crew"
            linkButton={{ url: '/crew', text: 'My crew' }}
        >
            <p>{`${crewsLimitCount}/${maximumCrews}`}</p>
            <div className="crews__crews-list">
                {crewsList?.map((crewItem) => (
                    <CrewItem key={crewItem.id} crew={crewItem} linkItem />
                ))}
            </div>
            {createAvailability && (
                <div className="button-container">
                    <Link to="crew/create">
                        <Button styleType="primary" color="blue">
                            Create a crew
                        </Button>
                    </Link>
                </div>
            )}
        </CrewsHeader>
    )
}

export default CrewsList
