import React from 'react'

import './Showcase.scss'
import Button from '../Button'
import { gql } from 'apollo-boost'
import { useMutation } from '@apollo/react-hooks'
import { useToast } from '../../game/_common/Toast'
import GraphErrors from '../../game/_common/GraphErrors'
import { EQUIPPED_ITEMS_QUERY } from '../../game/left-panel/components/EquippedLeftPanel'

const ITEM_EQUIP_MUTATION = gql`
    mutation EquipItemFromShowcase($input: SetItemEquippedInput!) {
        setItemEquipped(input: $input) {
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
`

function InventoryItemShowcaseEquip({ id, equipped, handleClose }) {
    const toast = useToast()
    const [mutateEquip, { loading, error }] = useMutation(ITEM_EQUIP_MUTATION)

    async function equipItem() {
        const { data } = await mutateEquip({
            variables: {
                input: {
                    id,
                    equipped: !equipped,
                },
            },
            refetchQueries: [{ query: EQUIPPED_ITEMS_QUERY }],
        })

        const success = data?.setItemEquipped?.equipped === !equipped
        const itemName = data?.setItemEquipped?.item?.name
        const whatHappened = !equipped ? 'equipped' : 'unequipped'
        if (success) {
            toast.add(
                'success',
                'Inventory',
                `You ${whatHappened} your ${itemName}.`
            )
        } else {
            toast.add(
                'error',
                'Inventory',
                `You couldn't ${whatHappened} your ${itemName}. The item might have changed before equipping.`
            )
        }

        if (success) {
            handleClose()
        }
    }

    return (
        <>
            <div className={`showcase-modal__right__cta`}>
                <div className={`showcase-modal__right__cta__disclaimer`}>
                    Equipping this item will unequip other items of the same
                    class. Equipping influences your criminal activities.
                    {error && <GraphErrors error={error} />}
                </div>
                <Button
                    type={`primary`}
                    color={equipped ? `red` : `blue`}
                    loading={loading}
                    onClick={equipItem}
                >
                    {equipped ? 'Unequip' : 'Equip'} Item
                </Button>
            </div>
        </>
    )
}

export default InventoryItemShowcaseEquip
