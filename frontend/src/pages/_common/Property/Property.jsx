import React from 'react'
import PropertyOwner from './PropertyOwner'
import { useQuery } from '@apollo/react-hooks'

import './Property.scss'
import { gql } from 'apollo-boost'
import IntegratedLoader from '../../game/_common/Loading/IntegratedLoader'

const PROPERTY_QUERY = gql`
    query PropertyLookup($input: PropertyInput!) {
        property(input: $input) {
            id
            propertyType
            currentState
            districtName
            player {
                id
                name
            }
            maximumBet
            previousRouletteWinners
        }
    }
`

function Property({ propertyType, children }) {
    const { data, error, loading } = useQuery(PROPERTY_QUERY, {
        fetchPolicy: 'cache-and-network',
        variables: {
            input: {
                propertyType,
            },
        },
    })
    if (loading || error) {
        return <IntegratedLoader />
    }
    const isPlayable =
        data?.property &&
        (data?.property?.player ||
            data?.property?.currentState === 'STATE_OWNED')

    /*
                {React.Children.map(children, child => (
                React.cloneElement(child, {style: {...child.props.style, opacity: 0.5}})
            ))}
     */

    return (
        <>
            {isPlayable &&
                React.Children.map(children, (child) =>
                    React.cloneElement(child, { property: data?.property })
                )}
            <PropertyOwner property={data?.property} />
        </>
    )
}

export default Property
