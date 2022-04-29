import React from 'react'
import PropTypes from 'prop-types'
import TextPill from './TextPill'

const GraphErrors = ({ error }) => {
    const errorPrompts = error?.graphQLErrors?.map((e) => e.message)

    return (
        <>
            {errorPrompts !== undefined ? (
                errorPrompts.map((errorPrompt) => (
                    <TextPill key={errorPrompt} style="error">
                        {errorPrompt}
                    </TextPill>
                ))
            ) : (
                <TextPill key="unk" style="error">
                    <p>Unknown error occurred.</p>
                </TextPill>
            )}
        </>
    )
}

GraphErrors.propTypes = {
    error: PropTypes.object.isRequired,
}

export default GraphErrors
