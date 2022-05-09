import React from 'react'
import Modal from '../../game/_common/Modal'
import './Estates.scss'
import Close from 'assets/images/close.svg'

import Image from '../../_common/Image/Image'
import BalanceItem from '../_common/BalanceItem'
import PercentBar from '../_common/PercentBar'
import Button from '../../_common/Button'
import BusinessItem from './BusinessItem'
import EstateAction from './EstateAction'

function EstatesModal({ estate, isOpen, handleClose }) {
    return (
        <Modal isOpen={isOpen} className="estate-modal">
            <div className="estate-modal__header">
                <div className="estate-modal__header__image">
                    <img src={estate?.image} alt={estate?.name} />
                </div>
                <div
                    className="estate-modal__header__close"
                    onClick={() => handleClose()}
                >
                    <Image src={Close} alt={`Close estate showcase`} />
                </div>
            </div>
            <div className="estate-modal__info">
                <div className="estate-modal__info__left">
                    <h4>{estate?.name}</h4>
                    <p className="estate-modal__info__left__location">
                        {estate?.location}
                    </p>
                </div>
                <p className="estate-modal__info__right">
                    <span>{`Producing daily: `}</span>
                    <BalanceItem
                        value={estate?.producingDaily}
                        currency="money"
                        showFull
                    />
                </p>
            </div>
            <div className="estate-modal__progress">
                <PercentBar
                    value={estate?.progress}
                    maxValue={estate?.maxProgress}
                    showMaxValue
                    unit=""
                    color="blue"
                    label={`Level ${estate?.level}`}
                />
            </div>
            <h4>Opportunities and liabilities</h4>
            {estate?.actions?.map((action) => (
                <EstateAction key={action?.id} action={action} />
            ))}
            {estate?.type === 'business' && (
                <div className="estate-modal__sell-close">
                    <Button styleType="primary" color="blue">
                        Sell business
                    </Button>
                    <Button styleType="secondary" color="white">
                        Close business
                    </Button>
                </div>
            )}
        </Modal>
    )
}

export default EstatesModal
