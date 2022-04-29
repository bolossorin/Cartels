import React from 'react'

import './Showcase.scss'
import Button from '../Button'
import { gql } from 'apollo-boost'
import { useMutation } from '@apollo/react-hooks'
import { useToast } from '../../game/_common/Toast'
import GraphErrors from '../../game/_common/GraphErrors'

const ITEM_CONSUME_MUTATION = gql`
    mutation ConsumeItemFromShowcase($input: UseConsumableItemInput!) {
        useConsumableItem(input: $input) {
            success
            message
            inventoryItem {
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
`

const PERKS_REFRESH_QUERY = gql`
    query ConsumePerksRefresh {
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

function InventoryItemShowcaseConsume({ id, handleClose }) {
    const toast = useToast()
    const [mutateConsume, { loading, error }] = useMutation(
        ITEM_CONSUME_MUTATION
    )

    async function consume() {
        const { data } = await mutateConsume({
            variables: {
                input: {
                    id,
                },
            },
            refetchQueries: [{ query: PERKS_REFRESH_QUERY }],
            awaitRefetchQueries: false,
        })

        const success = data?.useConsumableItem?.success
        const message = data?.useConsumableItem?.message
        const itemDepleted = !data?.useConsumableItem?.inventoryItem?.quantity
        toast.add(success ? 'success' : 'error', 'Inventory', message)

        if (itemDepleted) {
            handleClose()
        }
    }

    return (
        <>
            <div className={`showcase-modal__right__cta`}>
                <div className={`showcase-modal__right__cta__disclaimer`}>
                    Using this item will remove it from your inventory and add
                    it as a perk to your account for a limited time. If it's
                    already applied, it will add to the cooldown.
                    {error && <GraphErrors error={error} />}
                </div>
                <Button
                    type={`primary`}
                    color={`blue`}
                    loading={loading}
                    onClick={consume}
                >
                    Use Item
                </Button>
            </div>
        </>
    )
}

export default InventoryItemShowcaseConsume
