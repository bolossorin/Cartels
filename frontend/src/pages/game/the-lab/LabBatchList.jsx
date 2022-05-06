import React, { useState } from 'react'
import PropTypes from 'prop-types'
import ProductPills from 'img/inventory/ecstasy.png'
import ProductCoke from 'img/inventory/coke-new.png'
import ProductShot from 'img/inventory/adrenaline.png'
import ProductAcid from 'img/inventory/lsd.png'
import ProductMeth from 'img/inventory/meth.png'

import './Lab.scss'
import ProgressBar from '../_common/ProgressBar'
import TickManager from '../_common/TickManager'
import PercentBar from "../_common/PercentBar";

const BATCH_IMAGES = {
    cocaine: ProductCoke,
    lsd: ProductAcid,
    ecstasy: ProductPills,
    speed: ProductMeth,
}

function LabBatchList({ batchesList }) {
    if (batchesList.length === 0) {
        return <p className="no-batch">Nothing to see here</p>
    }

    return batchesList.map(
        ({ id, product, units, producing, startAt, finishAt }) => (
            <div key={id} className="batch">
                <div className="image-container">
                    <img src={BATCH_IMAGES[product]} alt={product} />
                </div>
                <div className="info-container">
                    <div className="text">
                        <h3>{product}</h3>
                        <p>{`${units} units`}</p>
                    </div>
                    <TickManager dateStart={startAt} dateEnd={finishAt}>
                        {({ seconds, style, percent, pretty }) => (
                            <PercentBar
                                maxValue={100}
                                value={percent}
                                label={
                                    style !== 'pending'
                                        ? pretty
                                        : 'Batch queued'
                                }
                                color={"white"}
                            >
                                {' '}
                            </PercentBar>
                        )}
                    </TickManager>
                </div>
            </div>
        )
    )
}

export default LabBatchList
