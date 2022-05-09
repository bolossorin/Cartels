import React from 'react'

import ErrorImage from '../../../assets/images/icons/error.svg'
import InfoImage from '../../../assets/images/icons/attention.svg'
import BonusImage from '../../../assets/images/icons/bonus.svg'

import './TextPill.scss'

function TextPill({ style, className, children, alt }) {
    const styleImages = {
        error: ErrorImage,
        bonus: BonusImage,
        info: InfoImage,
    }

    return (
        <>
            <div
                className={`text-pill text-pill__${style} ${
                    className ?? undefined
                }`}
            >
                <img
                    src={styleImages[style]}
                    alt={alt ?? 'Error'}
                    height="18"
                />{' '}
                {children}
            </div>
        </>
    )
}

export default TextPill
