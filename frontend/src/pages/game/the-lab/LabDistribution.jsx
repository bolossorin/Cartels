import React, { useState } from 'react'
import Button from '../../_common/Button'
import Weights from 'img/lab/weights.svg'
import LabLocation from './LabLocation'
import LabPurchaseExpander from './LabPurchaseExpander'

import BoxTruck from 'img/lab/box-truck.jpg'
import Safehouse from 'img/lab/safehouse.jpg'
import SemiTrailer from 'img/lab/semi.jpg'
import DistributionWarehouse from 'img/lab/distribution.jpg'
import useEvent from '../../../hooks/useEvent'

const IMAGE_MAP = {
    boxTruck: BoxTruck,
    safeHouse: Safehouse,
    semi: SemiTrailer,
    distributionWarehouse: DistributionWarehouse,
}

function LabDistribution({ hub, hubs }) {
    const triggerEvent = useEvent()
    const [expanded, setExpanded] = useState(false)

    function toggleExpanded() {
        if (!expanded) {
            triggerEvent({
                name: 'LAB_EXPAND_LOCATION_LIST',
                details: {
                    type: 'Distribution Hub',
                },
            })
        }
        setExpanded(!expanded)
    }

    return (
        <>
            <div className="item item--distribution">
                <div
                    className="item__head"
                    style={{
                        background: `url(${Weights})`,
                    }}
                >
                    <div className="text">
                        <h3>
                            <img src={Weights} alt="Weights" />
                            Distribution Hub
                        </h3>
                        {hub ? (
                            <p className="info">
                                {`${hub?.name}`}
                                <span>{` (${hub?.capability})`}</span>
                            </p>
                        ) : (
                            <p className="info">No location!</p>
                        )}
                    </div>
                    <div className="button-container">
                        <Button onClick={toggleExpanded} color="green">
                            {!expanded ? 'Buy Location' : 'Close'}
                        </Button>
                    </div>
                </div>
                <LabPurchaseExpander isOpen={expanded}>
                    <>
                        {hubs.map((lab) => {
                            return (
                                <LabLocation
                                    key={lab.id}
                                    location={{
                                        ...lab,
                                        image: IMAGE_MAP[lab.image],
                                    }}
                                    locationType="Drug Distribution Hub"
                                    attributes={[
                                        'Used to increase Lab capacity',
                                        'Lasts for the life of your character',
                                    ]}
                                />
                            )
                        })}
                    </>
                </LabPurchaseExpander>
            </div>
        </>
    )
}

export default LabDistribution
