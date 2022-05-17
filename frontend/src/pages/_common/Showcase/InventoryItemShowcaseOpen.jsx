import React, { useState } from 'react'

import './Showcase.scss'
import Button from '../Button'
import LootShowcase from '../LootShowcase/LootShowcase'

function InventoryItemShowcaseOpen({ id, handleClose }) {
    const [showcase, setShowcase] = useState(false)

    return (
        <>
            <div className={`showcase-modal__right__cta`}>
                <div className={`showcase-modal__right__cta__disclaimer`}>
                    Opening your item will consume it for rewards that may
                    include currency, other items or perks.
                </div>
                <Button
                    type={`primary`}
                    color={`blue`}
                    loading={false}
                    disabled={true}
                    onClick={() => {
                        setShowcase(true)
                    }}
                >
                    Open
                </Button>
            </div>
            <LootShowcase
                item={{}}
                handleClose={() => {
                    setShowcase(false)
                }}
                isOpen={showcase}
            />
        </>
    )
}

export default InventoryItemShowcaseOpen
