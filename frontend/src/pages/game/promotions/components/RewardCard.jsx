import React from 'react'
import BalanceItem from '../../_common/BalanceItem'

function RewardCard({ reward }) {
    return (
        <div
            className={`reward reward__revealed reward__${
                reward?.selected ? 'selected' : 'unselected'
            }`}
        >
            <BalanceItem
                value={reward?.amount}
                currency={reward?.type}
                showFull
            />
        </div>
    )
}

export default RewardCard
