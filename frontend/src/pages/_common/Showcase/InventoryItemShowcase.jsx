import React from 'react'
import Modal from '../../game/_common/Modal'

import Text from '../Text/Text'
import Image from '../Image/Image'
import Close from 'assets/images/close.svg'
import RarityTag from '../RarityTag/RarityTag'
import TextTag from '../TextTag/TextTag'

import './Showcase.scss'
import BalanceItem from '../../game/_common/BalanceItem'
import Button from '../Button'
import { gql } from 'apollo-boost'
import { useQuery } from '@apollo/react-hooks'
import { useToast } from '../../game/_common/Toast'
import InventoryItemShowcaseConsume from './InventoryItemShowcaseConsume'
import InventoryItemShowcaseEquip from './InventoryItemShowcaseEquip'

const ITEM_SHOWCASE_QUERY = gql`
    query InventoryItemShowcase($input: GetInventoryItemInput!) {
        getInventoryItem(input: $input) {
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

function InventoryItemShowcase({ id, isOpen, handleClose }) {
    const toast = useToast()
    const { data } = useQuery(ITEM_SHOWCASE_QUERY, {
        variables: {
            input: {
                id,
            },
        },
        fetchPolicy: 'cache-and-network',
        skip: !id,
    })

    const inventoryItem = data?.getInventoryItem
    const item = inventoryItem?.item
    const showcaseFactoids = inventoryItem?.showcaseFactoids

    return (
        <>
            <Modal isOpen={isOpen} className="showcase-modal">
                <div className={`showcase-modal__left`}>
                    <Text title24>{item?.name ?? 'Loading item...'}</Text>
                    <div className={`showcase-modal__left__image`}>
                        <Image
                            src={item?.horizontalImageUrl ?? item?.imageUrl}
                        />
                    </div>
                    <ul className={`showcase-modal__left__stats`}>
                        {showcaseFactoids?.map((fact) => (
                            <li
                                key={fact.title}
                                className={`${
                                    fact?.specialType ? 'special-factoid' : ''
                                }`}
                            >
                                <Text
                                    red={fact?.specialType ? undefined : ''}
                                    body12
                                >
                                    {fact.title}
                                </Text>
                                <Text red title24>
                                    {fact?.specialType === 'cash' ? (
                                        <BalanceItem
                                            currency="cash"
                                            value={fact?.text}
                                            showFull
                                        />
                                    ) : (
                                        <>{fact.text ?? '...'}</>
                                    )}
                                </Text>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className={`showcase-modal__right`}>
                    <div className={`showcase-modal__right__detail`}>
                        <div
                            className={`showcase-modal__right__detail__rarity`}
                        >
                            <RarityTag rarity={item?.rarity} />
                        </div>
                        <div
                            className={`showcase-modal__right__detail__close`}
                            onClick={() => handleClose()}
                        >
                            <Image src={Close} alt={`Close item showcase`} />
                        </div>
                    </div>
                    <div className={`showcase-modal__right__description`}>
                        <Text bodyGrey body16>
                            {item?.description}
                        </Text>
                    </div>
                    <div className={`showcase-modal__right__tags`}>
                        <TextTag>{item?.variant ?? 'Loading...'}</TextTag>
                        {item?.tradable && <TextTag>Tradable</TextTag>}
                        {item?.stackable && <TextTag>Stackable</TextTag>}
                    </div>
                    {item?.variant === 'consumable' && (
                        <InventoryItemShowcaseConsume
                            id={id}
                            handleClose={handleClose}
                        />
                    )}
                    {['weapon', 'protection'].includes(item?.variant) && (
                        <InventoryItemShowcaseEquip
                            id={id}
                            equipped={inventoryItem.equipped}
                            handleClose={handleClose}
                        />
                    )}
                </div>
            </Modal>
        </>
    )
}

export default InventoryItemShowcase
