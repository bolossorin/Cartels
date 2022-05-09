import React from 'react'
import PropTypes from 'prop-types'

import './ImageCardBox.scss'

const ImageCardBox = ({ image, title, contentTop, contentBottom, price }) => (
    <div className="image-card-box__item">
        <div className="image-card-box__item__image">
            <img src={image} alt="" />
        </div>
        <div className="image-card-box__text">
            <h3>{title}</h3>
            <div className="image-card-box__text__text">
                <p>{contentTop}</p>
                <p>{contentBottom}</p>
            </div>
            <div className="image-card-box__text__price">
                <p>{price}</p>
            </div>
        </div>
    </div>
)

ImageCardBox.propTypes = {
    image: PropTypes.node.isRequired,
    title: PropTypes.string.isRequired,
    contentTop: PropTypes.string,
    contentBottom: PropTypes.string,
    price: PropTypes.string,
}

ImageCardBox.defaultProps = {
    contentTop: '',
    contentBottom: '',
    price: '$0',
}

export default ImageCardBox
