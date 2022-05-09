import React from 'react'
import PropTypes from 'prop-types'
// import star from './star.svg';
import dice from 'img/bluedice.svg'
import InnerLoading from 'assets/images/public/favicon/favicon180.png'
import './FullScreenLoader.scss'

function IntegratedLoader() {
    return (
        <div className="loading-star integrated-loader">
            <img
                src={InnerLoading}
                className="loading-star__image loading-star__image__rotating"
                alt="Please wait, loading..."
            />
        </div>
    )
}

export default IntegratedLoader
