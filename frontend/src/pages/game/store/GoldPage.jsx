import React, { useState } from 'react'
import { gql } from 'apollo-boost'
import { useMutation, useQuery } from '@apollo/react-hooks'
import GoldItem from './GoldItem'
import { NavItems } from '../../../config'
import { Link } from 'react-router-dom'
import Gold1 from 'img/gold/1.png'
import Gold2 from 'img/gold/2.png'
import Gold3 from 'img/gold/3.png'
import Gold4 from 'img/gold/4.png'
import Gold5 from 'img/gold/5.png'
import Gold6 from 'img/gold/6.png'
import './Store.scss'

const GOLD_ITEMS_QUERY = gql`
    query storeItems {
        storeItems {
            id
            price
            goldAmount
            goldBonus
            image
            labelCode
            labelText
        }
    }
`

function GoldPage() {
    const { data, refetch } = useQuery(GOLD_ITEMS_QUERY, {
        fetchPolicy: 'cache-and-network',
    })

    const goldItems = data?.storeItems
    return (
        <div className="gold-market">
            {goldItems?.map((goldItem) => (
                <div key={goldItem?.id} className="gold-market__item">
                    <GoldItem goldItem={goldItem} />
                </div>
            ))}
        </div>
    )
}

export default GoldPage
