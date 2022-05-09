import React from 'react'
import IntegratedLoader from './IntegratedLoader'

import './FullScreenLoader.scss'

function FullScreenLoader() {
    return (
        <div className={`full-screen-loader`}>
            <IntegratedLoader />
        </div>
    )
}

export default FullScreenLoader
