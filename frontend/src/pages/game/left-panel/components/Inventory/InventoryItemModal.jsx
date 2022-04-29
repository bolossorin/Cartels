import Modal from '../../../_common/Modal'
import React from 'react'

import './InventoryItemModal.scss'
import StyleButton from '../../../_common/StyleButton'
import Button from '../../../_common/Button/Button'
import InventoryItemLabMarket from './InventoryItemLabMarket'

const a = {
    options: [
        {
            type: 'lab_market',
        },
    ],
}

function InventoryItemModal({ inventoryItem, isOpen, handleClose }) {
    const item = inventoryItem.item
    const options = item?.options

    const isLabMarket = options?.some((option) => option.type === 'lab_market')

    return (
        <Modal className="main modal-inventory-item" isOpen={isOpen}>
            <div className="modal-inventory-item__container">
                <div className="modal-inventory-item__image">
                    <img src={item.imageUrl} alt={`${item.name}`} />
                </div>
                <div className="modal-inventory-item__description">
                    <h1>
                        {inventoryItem.quantity}x {item.name}
                    </h1>
                    {isLabMarket && (
                        <InventoryItemLabMarket
                            inventoryItem={inventoryItem}
                            handleClose={handleClose}
                        />
                    )}
                </div>
            </div>
        </Modal>
    )
}

export default InventoryItemModal
