import React from 'react'
import Star from 'img/login/rotating-star-centered-01.svg'
import { gql } from 'apollo-boost'
import { useQuery } from '@apollo/react-hooks'
import './StatsItem.scss'
import LootItem from '../ResultScreen/LootItem'
import Text from '../../../_common/Text/Text'

function StatsItem({ name, stats, image }) {
    return (
        <div className="stats-item">
            <img className="stats-item__image" src={image} alt={name} />
            <div className="stats-item__content">
                <h3 className="stats-item__content__name">{name}</h3>
                <div className="stats-item__content__stats">
                    {stats.map((stat) => (
                        <p
                            className={`stats-item__content__stats__stat stats-item__content__stats__stat--${stat.color}`}
                        >
                            {`${stat.name}: `}
                            <span>
                                {stat.value?.toLocaleString('en-US') ??
                                    stat.value}
                            </span>
                        </p>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default StatsItem
