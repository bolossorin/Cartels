import React from 'react'
import { gql } from 'apollo-boost'
import { useQuery } from '@apollo/react-hooks'

import './Customs.scss'

import TSABadge from 'img/TSA2.png'
import IntegratedLoader from '../_common/Loading/IntegratedLoader'
import { useToast } from '../_common/Toast'
import PercentBar from "../_common/PercentBar";

const MARKET_PRICING_QUERY = gql`
    query CustomsInfo {
        customs {
            min
            max
            current
            description
            label
            travelRestriction
        }
    }
`

function Customs() {
    const toast = useToast()
    const { data } = useQuery(MARKET_PRICING_QUERY, {
        fetchPolicy: 'cache-and-network',
    })

    const customsInfo = data?.customs

    function test() {
        toast.add(
            'info',
            'Customs Enforcement',
            `Don't even think about it, tough guy.`
        )
    }

    return (
        <>
            <div className="customs__box" onClick={test}>
                <div className="customs__box__image">
                    <img src={TSABadge} alt={'TSA Badge'} />
                </div>
                <div className="customs__box__info">
                    {customsInfo ? (
                        <>
                            <p>{customsInfo?.description}</p>
                            <PercentBar
                                value={customsInfo?.current}
                                maxValue={customsInfo?.max}
                                showMaxValue
                                unit="XP"
                                color="yellow"
                                label={`${customsInfo?.label}`}
                            >
                                {`${customsInfo?.current} / ${customsInfo?.max} Units`}
                            </PercentBar>
                        </>
                    ) : (
                        <IntegratedLoader />
                    )}
                </div>
            </div>
        </>
    )
}

export default Customs
