import React, { useState } from 'react'
import star from 'img/error_red.svg'
import './FullScreenError.scss'
import { AUTH_TOKEN } from '../../../config'
import { Redirect } from 'react-router'

function stripTechnicalInformation(error) {
    return (
        error?.replace('Context creation failed: ', '') ??
        'Unable to reach Cartels servers'
    )
}

function FullScreenError({ error }) {
    const [redirect, setRedirect] = useState(false)
    const errorMsg =
        error &&
        stripTechnicalInformation(
            error?.networkError?.result?.errors?.[0]?.message
        )

    function returnToLogin() {
        window.localStorage.removeItem(AUTH_TOKEN)
        setRedirect(true)
    }

    if (redirect) {
        return <Redirect to="/" />
    }

    return (
        <div className="error-icon">
            <img
                src={star}
                className="error-icon__image"
                alt="An error occurred"
            />
            <p>
                <strong>Game error</strong>
                {errorMsg ?? 'Unknown error'}
                <button className="error-return" onClick={returnToLogin}>
                    Return to login page
                </button>
            </p>
        </div>
    )
}

export default FullScreenError
