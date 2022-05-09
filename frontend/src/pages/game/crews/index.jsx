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
import { useHistory, useParams } from 'react-router'
import Button from '../../_common/Button'
import CrewsHeader from './CrewsHeader'

const VIEWER_QUERY = gql`
    query PlayerQuery {
        viewer {
            player {
                id
                crew {
                    id
                }
            }
        }
    }
`

function Crews() {
    const history = useHistory()
    const { data, loading } = useQuery(VIEWER_QUERY)
    const isInACrew = !!data?.viewer?.player?.crew

    if (isInACrew) {
        history.push(`/my-crew`)
    }
    if (!isInACrew) {
        history.push(`/crews-list`)
    }

    return <CrewsHeader title="Crews" linkTo="/crew" />
}

export default Crews
