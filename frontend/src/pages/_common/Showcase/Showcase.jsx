import React from 'react'
import Modal from '../../game/_common/Modal'

import Text from '../Text/Text'
import Image from '../Image/Image'
import Close from 'assets/images/close.svg'
import RarityTag from '../RarityTag/RarityTag'
import TextTag from '../TextTag/TextTag'

import './Showcase.scss'

function Showcase({ item, children, isOpen, handleClose }) {
    return (
        <>
            <Modal isOpen={isOpen} className="showcase-modal">
                <div className={`showcase-modal__left`}>
                    <Text title24>{item?.name ?? 'unk'}</Text>
                    <div className={`showcase-modal__left__image`}>
                        <Image
                            src={item?.horizontalImageUrl ?? item?.imageUrl}
                        />
                    </div>
                    <ul className={`showcase-modal__left__stats`}>
                        <li>
                            <Text red body12>
                                Stats
                            </Text>
                            <Text red title24>
                                {item?.strengthDisplay ?? '...'}
                            </Text>
                        </li>
                        {/*<li>*/}
                        {/*    <Text bodyGrey body12>*/}
                        {/*        Resale Price*/}
                        {/*    </Text>*/}
                        {/*    <Text bodyGrey title24>*/}
                        {/*        $1,278*/}
                        {/*    </Text>*/}
                        {/*</li>*/}
                    </ul>
                </div>
                <div className={`showcase-modal__right`}>
                    <div className={`showcase-modal__right__detail`}>
                        <div
                            className={`showcase-modal__right__detail__rarity`}
                        >
                            <RarityTag rarity={item?.rarity} />
                        </div>
                        <div
                            className={`showcase-modal__right__detail__close`}
                            onClick={() => handleClose()}
                        >
                            <Image src={Close} alt={`Close item showcase`} />
                        </div>
                    </div>
                    <div className={`showcase-modal__right__description`}>
                        <Text bodyGrey body16>
                            {item?.description}
                        </Text>
                    </div>
                    <div className={`showcase-modal__right__tags`}>
                        <TextTag>{item?.variant ?? 'unk'}</TextTag>
                        {item?.tradable && <TextTag>Tradable</TextTag>}
                        {item?.stackable && <TextTag>Stackable</TextTag>}
                    </div>
                    {children}
                </div>
            </Modal>
        </>
    )
}

export default Showcase
