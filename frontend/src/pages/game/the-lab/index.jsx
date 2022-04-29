import React, { useEffect, useState } from 'react'
import LabHeader from 'img/lab/lab.png'

import ProductPills from 'img/inventory/pills.png'
import ProductCoke from 'img/inventory/coke.png'
import ProductShot from 'img/inventory/adrenaline.png'
import ProductAcid from 'img/inventory/lsd.png'
import LabBackground from 'img/lab/background.png'

import LabBatchList from './LabBatchList.jsx'

import './Lab.scss'
import Button from '../_common/Button/Button'
import TextPill from '../_common/TextPill'
import LabManufacturing from './LabManufacturing'
import LabDistribution from './LabDistribution'
import LabPurityGrade from './LabPurityGrade'
import { gql } from 'apollo-boost'
import { useQuery } from '@apollo/react-hooks'
import IntegratedLoader from '../_common/Loading/IntegratedLoader'
import LabBatchManager from './LabBatchManager'
import ProgressStrip from '../_common/ProgressStrip'
import LabMarketButton from './LabMarketButton'
import Content from "../../_common/Content/Content";
import Masthead from "../../_common/Masthead/Masthead";
import DrugMarketItem from "./market/MarketItem";
import BalanceItem from "../_common/BalanceItem";
import Customs from "./Customs";
import PercentBar from "../_common/PercentBar";

const MARKET = [
    {
        product: 'LSD',
        units: 5,
        price: 67,
        image: ProductAcid,
    },
    {
        product: 'Cocaine',
        units: 5,
        price: 67,
        image: ProductCoke,
    },
    {
        product: 'Speed',
        units: 5,
        price: 67,
        image: ProductShot,
    },
    {
        product: 'Ecstasy',
        units: 5,
        price: 67,
        image: ProductPills,
    },
]

const LAB = gql`
    query Lab {
        lab {
            id
            items {
                id
                name
                capability
                prices {
                    crypto
                    cash
                }
                image
                variant
                unlock
                owned
                locked
                equipped
            }
            minimumRequirementsMet
            progression {
                id
                level
                progress
                progressMin
                progressTarget
            }
            batchesUnitCount
            maximumUnits
            batches {
                id
                product
                units
                producing
                startAt
                finishAt
            }
        }
    }
`

function Lab() {
    const { data, loading } = useQuery(LAB)
    // const [tab, setTab] = useState(TABS.Manage)

    if (loading) {
        return <IntegratedLoader text="Getting lab information" />
    }

    const items = data?.lab?.items
    const hubs = items?.filter((item) => item.variant === 'DISTRIBUTION_HUB')
    const hub = hubs?.find((item) => item.equipped)
    const labs = items?.filter((item) => item.variant === 'MANUFACTURING_LAB')
    const lab = labs?.find((item) => item.equipped)

    const minimumRequirementsMet = data?.lab?.minimumRequirementsMet
    const labProgress = data?.lab?.progression

    return (
        <Content color="game" className="lab">
            <Masthead fullWidth>
                Lab
            </Masthead>
            <img className="background" src={LabBackground} alt="Lab" />
            <div className="lab-manage">
                <div className="header-advice">
                    {minimumRequirementsMet ? (
                        <TextPill style="info">
                            Start producing batches of product below
                            and sell it on the Market.
                        </TextPill>
                    ) : (
                        <TextPill style="info">
                            Invest in a Manufacturing Lab and
                            Distribution Hub to start operations.
                        </TextPill>
                    )}
                </div>
                <PercentBar
                    value={labProgress?.progress}
                    maxValue={labProgress?.progressTarget}
                    showMaxValue
                    unit="XP"
                    color="blue"
                    label={`Level ${labProgress?.level}`}
                />
                {minimumRequirementsMet && <LabBatchManager />}
                <div className="lab-properties">
                    <LabManufacturing labs={labs} lab={lab} />
                    <LabDistribution hubs={hubs} hub={hub} />
                    {/*<LabPurityGrade lab={items} />*/}
                </div>
                <LabMarketButton />
                <div className="batches-list">
                    <h2>
                        Batch queue (
                        {`${data?.lab?.batchesUnitCount} of ${data?.lab?.maximumUnits} units`}
                        )
                    </h2>
                    <LabBatchList batchesList={data?.lab?.batches} />
                </div>
            </div>
        </Content>
    )
}

export default Lab
