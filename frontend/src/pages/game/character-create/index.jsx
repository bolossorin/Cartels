import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Modal from '../_common/Modal'
import gql from 'graphql-tag'
import { useMutation } from '@apollo/react-hooks'
import { Formik } from 'formik'

import AssassinImage from 'img/CharacterCreate/assassin_center.png'
import EntrepreneurImage from 'img/CharacterCreate/entrepreneur.png'
import GangsterImage from 'img/CharacterCreate/gangster.png'
import AttackImage from 'img/CharacterCreate/damage.svg'
import CashImage from 'img/CharacterCreate/dollars.svg'
import TextInput from '../_common/Form/TextInput'
import Button from '../_common/Form/Button'
import TextPill from '../_common/TextPill'

import './CharacterCreate.scss'
import GraphErrors from '../_common/GraphErrors'

const CREATE_INITIAL_PLAYER = gql`
    mutation createInitialPlayer($name: String!, $character: PlayerCharacter!) {
        createInitialPlayer(name: $name, character: $character) {
            id
            name
            character
            rank
            role
            stats {
                bustSuccess
                bustFail
                bustTotal
                bustStreak
                bustStreakMax
                bustedSuccess
                bustedFail
                escapeSuccess
                escapeFail
                escapeStreak
                escapeStreakMax
                crimeSuccess
                crimeEvaded
                crimeJailed
                crimeLootCash
                forumReplies
                forumPosts
                carTheftSuccess
                carTheftFlawlessSuccess
                carTheftFail
                carTheftJailed
            }
        }
    }
`

const POSE_GANGSTER = {
    key: 'gangster',
    src: GangsterImage,
    name: 'Gangster',
    tagline: 'Best of both worlds',
    stats: [AttackImage, AttackImage, CashImage, CashImage],
}
const POSE_ASSASSIN = {
    key: 'assassin',
    src: AssassinImage,
    name: 'Assassin',
    tagline: 'Patient, accurate, deadly',
    stats: [AttackImage, AttackImage, AttackImage, CashImage],
}
const POSE_ENTREPRENEUR = {
    key: 'entrepreneur',
    src: EntrepreneurImage,
    name: 'Entrepreneur',
    tagline: 'Cash flow virtuoso',
    stats: [AttackImage, CashImage, CashImage, CashImage],
}

const POSE_ORDER = {
    Entrepreneur: [POSE_ASSASSIN, POSE_ENTREPRENEUR, POSE_GANGSTER],
    Assassin: [POSE_GANGSTER, POSE_ASSASSIN, POSE_ENTREPRENEUR],
    Gangster: [POSE_ASSASSIN, POSE_GANGSTER, POSE_ENTREPRENEUR],
}

function CharacterCreate({ onCreateInitialCharacter, isOpen }) {
    const [order, setPosingCharacter] = useState(POSE_ORDER.Gangster)
    const [createPlayer, { loading, error }] = useMutation(
        CREATE_INITIAL_PLAYER
    )

    const posedName = order[1].name
    const posedClass = order[1].key
    const posedTagline = order[1].tagline
    const posedStats = order[1].stats

    return (
        <Modal title="Choose your class and name" isOpen={isOpen}>
            <div>
                <div
                    className={`character-picker character-picker__${posedClass}`}
                >
                    <ul className="character-picker__characters">
                        {order.map((item, _) => {
                            return (
                                <motion.li
                                    positionTransition
                                    key={item.key}
                                    onClick={() =>
                                        setPosingCharacter(
                                            POSE_ORDER[item.name]
                                        )
                                    }
                                >
                                    <img
                                        src={item.src}
                                        alt={item.key}
                                        className={`character-picker__characters__${item.key}`}
                                    />
                                </motion.li>
                            )
                        })}
                    </ul>
                    <div className="character-picker__stage" />
                    <div className="character-picker__info-container">
                        <div className="character-picker__info">
                            <div className="character-picker__info_title">
                                <h2>{posedName}</h2>
                                <p>{posedTagline}</p>
                            </div>
                            <div className="character-picker__info_stats">
                                {posedStats.map((Image, idx) => (
                                    <img
                                        key={`icon${idx}`}
                                        src={Image}
                                        alt={`${posedName} stat`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="character-form">
                    <Formik
                        initialValues={{ displayName: '' }}
                        onSubmit={(values, actions) => {
                            createPlayer({
                                variables: {
                                    name: values.displayName,
                                    character: posedName.toUpperCase(),
                                },
                            })
                                .then((_) => {
                                    onCreateInitialCharacter()
                                })
                                .catch((_) => {
                                    console.log('cic error')
                                })
                        }}
                    >
                        {(props) => (
                            <form
                                onSubmit={props.handleSubmit}
                                className={`${
                                    props.isSubmitting
                                        ? 'form__loading'
                                        : 'form'
                                }`}
                            >
                                <TextInput
                                    name="displayName"
                                    placeholder="Enter a character name"
                                    size={TextInput.Sizes.FullWidth}
                                    maxLength="13"
                                />
                                {error && <GraphErrors error={error} />}
                                <p>A-Z 0-9 AND DASHES ALLOWED (3-13 CHARS)</p>
                                <Button
                                    size={Button.Sizes.LargeCTA}
                                    disabled={loading ? 'disabled' : undefined}
                                >
                                    CREATE YOUR CHARACTER
                                </Button>
                            </form>
                        )}
                    </Formik>
                </div>
            </div>
        </Modal>
    )
}

export default CharacterCreate
