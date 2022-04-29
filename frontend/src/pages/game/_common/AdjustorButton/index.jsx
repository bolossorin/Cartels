import React from 'react'
import Button from '../../../_common/Button'

function AdjustorButton({
    form,
    targetField,
    targetMax,
    children,
    color,
    styleType,
}) {
    function handleSetMax() {
        form.setFieldValue(targetField, `${targetMax}`)
    }

    return (
        <Button
            onClick={handleSetMax}
            linkTag
            color={color}
            styleType={styleType}
        >
            {children}
        </Button>
    )
}

export default AdjustorButton
