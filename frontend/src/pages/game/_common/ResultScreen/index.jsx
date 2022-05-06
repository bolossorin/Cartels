import React from 'react'
import CrimeImage from 'img/crimes/minor/3-rob-mob-compound.jpg'
import LockpickTools from 'img/inventory/lock.png'
import './ResultScreen.scss'
import Content from '../../../_common/Content/Content'
import LootItem from './LootItem'
import BalanceItem from '../BalanceItem'

function ResultScreen({ image, title, label, cooldown, loot }) {
    return (
        <Content className="result-screen">
            <div className="image-container">
                <img src={image ?? ''} alt={title ?? ''} />
                <div className="text-container">
                    <h3>{title ?? 'Unknown'}</h3>
                    <p>{label ?? 'Unknown'}</p>
                    <h4>{cooldown ?? '?'}</h4>
                </div>
            </div>
            {!!loot && (
                <>
                    <h2>Loot</h2>
                    <div className="loot-container">
                        {loot.map((loot) => (
                            <LootItem key={loot?.name ?? 'loot'} loot={loot} />
                        ))}
                    </div>
                </>
            )}
        </Content>
    )
}

export default ResultScreen
