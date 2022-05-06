import React from 'react'
import './Image.scss'
import { getStaticUrl } from '../../../utils/images'

function Image({ src, alt, opts, className }) {
    let source = src
    if (opts) {
        source = getStaticUrl(src, opts)
    }

    return (
        <div className={`image ${className ? className : ''}`}>
            <img src={source} alt={alt ?? `Image`} />
        </div>
    )
}

export default Image
