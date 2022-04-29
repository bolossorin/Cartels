import React, { useState } from 'react'
import { Link } from 'react-router-dom'

import './Inventory.scss'
import Modal from '../../../_common/Modal'
import { gql } from 'apollo-boost'
import { useQuery } from '@apollo/react-hooks'
import InventoryItem from './InventoryItem'
import InventoryItemShowcase from '../../../../_common/Showcase/InventoryItemShowcase'

export const PLAYER_ITEMS_QUERY = gql`
    query PlayerItems {
        viewer {
            player {
                id
                inventory {
                    itemsCount
                    items {
                        id
                        equipped
                        quantity
                        createdAt
                        item {
                            id
                            code
                            name
                            variant
                            description
                            imageUrl
                            rarity
                            stackable
                            tradable
                            options {
                                type
                            }
                        }
                        showcaseFactoids {
                            title
                            text
                            specialType
                        }
                    }
                }
            }
        }
    }
`

function InventoryGrid() {
    const [selectedItem, setSelectedItem] = useState(undefined)
    const { data, refetch } = useQuery(PLAYER_ITEMS_QUERY, {
        pollInterval: 15000,
    })

    const inventory = data?.viewer?.player?.inventory
    const items = inventory?.items

    function handleSelect(inventoryItem) {
        setSelectedItem(inventoryItem)
    }

    function handleClose() {
        setSelectedItem(undefined)
        refetch()
    }

    return (
        <>
            <InventoryItemShowcase
                id={selectedItem?.id}
                isOpen={!!selectedItem}
                handleClose={handleClose}
            />
            <ul>
                {items &&
                    items?.map((inventoryItem) => (
                        <InventoryItem
                            key={inventoryItem.id}
                            inventoryItem={inventoryItem}
                            handleSelect={handleSelect}
                        />
                    ))}
            </ul>
        </>
    )
}

export default InventoryGrid
