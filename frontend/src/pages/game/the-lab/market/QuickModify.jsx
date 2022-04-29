import React from 'react'

import './LabMarket.scss'
import { Field } from 'formik'
import AdjustorButton from '../../_common/AdjustorButton'

function QuickModify({ fieldName, quantity }) {
    return (
        <>
            <div className="lab-market-item__control__modify">
                <Field
                    name={`${fieldName}Max`}
                    component={AdjustorButton}
                    targetField={fieldName}
                    targetMax={quantity ?? '0'}
                    color="yellow"
                    styleType="primary"
                >
                    All on hand
                </Field>
                <Field
                    name={`${fieldName}None`}
                    component={AdjustorButton}
                    targetField={fieldName}
                    targetMax={'0'}
                    color="white"
                    styleType="primary"
                >
                    None
                </Field>
            </div>
        </>
    )
}

export default QuickModify
