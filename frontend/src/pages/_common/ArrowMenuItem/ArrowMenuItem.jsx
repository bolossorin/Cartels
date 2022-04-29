import React from 'react'
import Image from '../Image/Image'

import Arrow from 'assets/images/arrow.svg'
import { Link } from 'react-router-dom'
import Content from '../Content/Content'

import './ArrowMenuItem.scss'

function ArrowMenuItem({
    src,
    onClick,
    count,
    countColor,
    title,
    description,
}) {
    let BaseElement = 'div'
    if (src) {
        BaseElement = Link
    }

    const showArrow = !!src || !!onClick

    return (
        <BaseElement
            to={src ?? undefined}
            onClick={onClick ?? undefined}
            className={`arrow-menu-item ${
                showArrow ? `arrow-menu-item__linked` : ''
            }`}
        >
            {count && (
                <div
                    className={`arrow-menu-item__count arrow-menu-item__count__${countColor}`}
                >
                    {count}
                </div>
            )}
            <div className={`arrow-menu-item__text`}>
                <p className={`arrow-menu-item__text__title`}>{title}</p>
                {description && (
                    <p className={`arrow-menu-item__text__description`}>
                        {description}
                    </p>
                )}
            </div>
            {showArrow && (
                <div className={`arrow-menu-item__arrow`}>
                    <Image src={Arrow} alt={`Open ${title}`} />
                </div>
            )}
        </BaseElement>
    )
}

export default ArrowMenuItem
