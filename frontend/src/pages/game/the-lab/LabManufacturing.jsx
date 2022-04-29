import React, { useState } from 'react'
import Beaker from 'img/lab/beaker.svg'
import Button from '../../_common/Button'
import LabLocation from './LabLocation'
import LabPurchaseExpander from './LabPurchaseExpander'

import Crackhouse from 'img/lab/crackhouse.jpg'
import SuburbanHouse from 'img/lab/suburbanhouse.jpg'
import RV from 'img/lab/rv.jpg'
import ProfessionalLab from 'img/lab/chemical-lab.jpg'
import Warehouse from 'img/lab/warehouse.jpg'
import Megalab from 'img/lab/megalab.jpg'
import useEvent from '../../../hooks/useEvent'

const IMAGE_MAP = {
    crackHouse: Crackhouse,
    suburbanHouse: SuburbanHouse,
    rv: RV,
    professionalLab: ProfessionalLab,
    warehouse: Warehouse,
    megalab: Megalab,
}

function LabManufacturing({ labs, lab }) {
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
            <div className="item item--manufacture">
                <div
                    className="item__head"
                    style={{
                        background: `url(${Beaker})`,
                    }}
                >
                    <div className="text">
                        <h3>
                            <img src={Beaker} alt="Beaker" />
                            Manufacturing Lab
                        </h3>
                        {lab ? (
                            <p className="info">
                                {`${lab?.name}`}
                                <span>{` (${lab?.capability})`}</span>
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
                        {labs.map((lab) => {
                            return (
                                <LabLocation
                                    key={lab.id}
                                    location={{
                                        ...lab,
                                        image: IMAGE_MAP[lab.image],
                                    }}
                                    locationType="Drug Manufacturing Lab"
                                    attributes={[
                                        'Used to increase Lab production speed',
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

export default LabManufacturing
