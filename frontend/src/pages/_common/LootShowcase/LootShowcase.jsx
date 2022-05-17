import React from 'react'
import Modal from '../../game/_common/Modal'

import './LootShowcase.scss'

import GoldenEgg from 'assets/images/easter/egg_7.png'
import PDA from 'assets/items/assets/blackhat_pda/blackhat_pda_render_1.png'
import Port from 'assets/items/assets/portable_radio/portable_radio_render_1.png'
import Prac from 'assets/items/assets/practice_lock/practice_lock_render_1.png'
import { motion, AnimatePresence } from 'framer-motion'

import Button from '../Button'

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
}

const itemx = {
    hidden: { opacity: 0, scale: 0, top: 40 },
    show: { duration: 1.4, opacity: 1, scale: 1, top: 0 },
}

function LootShowcase({ item, children, isOpen, handleClose }) {
    return (
        <>
            <Modal isOpen={isOpen} className="loot-showcase">
                <div className="loot-showcase__content">
                    <div className="loot-showcase__content__opened-item">
                        {/*<img src={GoldenEgg} alt={'f'} />*/}
                    </div>
                    <div className="loot-showcase__content__loot-items">
                        <motion.div
                            variants={container}
                            className="loot-showcase__content__loot-items__grid"
                            initial="hidden"
                            animate="show"
                        >
                            <motion.div
                                variants={itemx}
                                className="loot-showcase__content__loot-items__grid__item"
                            >
                                <div className="loot-showcase__content__loot-items__grid__item__image">
                                    <img src={PDA} alt={'f'} />
                                </div>
                            </motion.div>
                            <motion.div
                                variants={itemx}
                                className="loot-showcase__content__loot-items__grid__item"
                            >
                                <div className="loot-showcase__content__loot-items__grid__item__image">
                                    <img src={Port} alt={'f'} />
                                </div>
                            </motion.div>
                            <motion.div
                                variants={itemx}
                                className="loot-showcase__content__loot-items__grid__item"
                            >
                                <div className="loot-showcase__content__loot-items__grid__item__image">
                                    <img src={Prac} alt={'f'} />
                                </div>
                            </motion.div>
                            <motion.div
                                variants={itemx}
                                className="loot-showcase__content__loot-items__grid__item"
                            >
                                <div className="loot-showcase__content__loot-items__grid__item__image">
                                    <img src={Prac} alt={'f'} />
                                </div>
                            </motion.div>
                            <motion.div
                                variants={itemx}
                                className="loot-showcase__content__loot-items__grid__item"
                            >
                                <div className="loot-showcase__content__loot-items__grid__item__image">
                                    <img src={Prac} alt={'f'} />
                                </div>
                            </motion.div>
                            <motion.div
                                variants={itemx}
                                className="loot-showcase__content__loot-items__grid__item"
                            >
                                <div className="loot-showcase__content__loot-items__grid__item__image">
                                    <img src={Prac} alt={'f'} />
                                </div>
                            </motion.div>
                            <motion.div
                                variants={itemx}
                                className="loot-showcase__content__loot-items__grid__item"
                            >
                                <div className="loot-showcase__content__loot-items__grid__item__image">
                                    <img src={Prac} alt={'f'} />
                                </div>
                            </motion.div>
                            <motion.div
                                variants={itemx}
                                className="loot-showcase__content__loot-items__grid__item"
                            >
                                <div className="loot-showcase__content__loot-items__grid__item__image">
                                    <img src={Prac} alt={'f'} />
                                </div>
                            </motion.div>
                            <motion.div
                                variants={itemx}
                                className="loot-showcase__content__loot-items__grid__item"
                            >
                                <div className="loot-showcase__content__loot-items__grid__item__image">
                                    <img src={Prac} alt={'f'} />
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                    <div className="loot-showcase__content__buttons">
                        <Button
                            styleType="secondary"
                            color="blue"
                            onClick={handleClose}
                        >
                            Closed
                        </Button>
                        <Button styleType="primary" color="blue">
                            Reveal loot
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    )
}

export default LootShowcase
