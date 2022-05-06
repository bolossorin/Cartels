import React from 'react'

function LabPurchaseExpander({ children, isOpen }) {
    return (
        <>
            <div
                className={`purchase-expander purchase-expander__${
                    isOpen ? 'open' : 'closed'
                }`}
            >
                <div className="purchase-expander__grid">{children}</div>
            </div>
        </>
    )
}

export default LabPurchaseExpander
