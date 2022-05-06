import React, { useState } from 'react'
import Numerals from 'numeral'

function InventoryItem({ inventoryItem, handleSelect }) {
    const item = inventoryItem.item

    return (
        <li key={inventoryItem.id}>
            <div className="inventory-box__tooltip">
                <div className="inventory-box__tooltip__box">test</div>
            </div>
            <a
                onClick={() => handleSelect(inventoryItem)}
                className={`inventory-box__item item-rarity-${item.rarity}`}
            >
                <div className="inventory-box__image-container">
                    <img src={item.imageUrl} alt={`${item.name}`} />
                </div>
                <div
                    className={`inventory-box__item__count ${
                        inventoryItem.quantity > 999
                            ? 'inventory-box__item__count--above-limit'
                            : ''
                    }`}
                >
                    <span className="default">
                        {inventoryItem.quantity > 999
                            ? Numerals(inventoryItem.quantity).format(
                                  '0,0a',
                                  Math.floor
                              )
                            : inventoryItem.quantity}
                    </span>
                    {inventoryItem.quantity > 999 && (
                        <span className="full">
                            {Numerals(inventoryItem.quantity).format(
                                '0,0',
                                Math.floor
                            )}
                        </span>
                    )}
                </div>
                {inventoryItem.equipped && (
                    <div className="inventory-box__worn">
                        <svg
                            width="17"
                            height="19"
                            viewBox="0 0 17 19"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                opacity="0.5"
                                d="M17 4.35417V15.8333C17 17.575 15.6091 19 13.9091 19H8.26818C7.43364 19 6.64545 18.6596 6.06591 18.0579L0 11.7404C0 11.7404 0.973636 10.7667 1.00455 10.7508C1.17455 10.6004 1.38318 10.5212 1.615 10.5212C1.785 10.5212 1.93955 10.5688 2.07864 10.6479C2.10955 10.6558 5.40909 12.5954 5.40909 12.5954V3.16667C5.40909 2.50958 5.92682 1.97917 6.56818 1.97917C7.20955 1.97917 7.72727 2.50958 7.72727 3.16667V8.70833H8.5V1.1875C8.5 0.530417 9.01773 0 9.65909 0C10.3005 0 10.8182 0.530417 10.8182 1.1875V8.70833H11.5909V1.97917C11.5909 1.32208 12.1086 0.791667 12.75 0.791667C13.3914 0.791667 13.9091 1.32208 13.9091 1.97917V8.70833H14.6818V4.35417C14.6818 3.69708 15.1995 3.16667 15.8409 3.16667C16.4823 3.16667 17 3.69708 17 4.35417Z"
                            />
                        </svg>
                    </div>
                )}
                <div className="rarity-band">
                    <div className="triangle" />
                </div>
            </a>
        </li>
    )
}

export default InventoryItem
