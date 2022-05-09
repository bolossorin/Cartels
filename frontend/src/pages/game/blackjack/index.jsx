import React, { useEffect, useState } from 'react'
import IntegratedLoader from '../_common/Loading/IntegratedLoader'
import Locked from 'img/crimes/locked-crime.svg'
import { gql } from 'apollo-boost'
import { useMutation, useQuery } from '@apollo/react-hooks'
import Content from '../../_common/Content/Content'
import Masthead from '../../_common/Masthead/Masthead'
import Numerals from 'numeral'
import { Field, Formik } from 'formik'
import Club1 from 'img/cards/CLUB-1.svg'
import Club2 from 'img/cards/CLUB-2.svg'
import Club3 from 'img/cards/CLUB-3.svg'
import Club4 from 'img/cards/CLUB-4.svg'
import Club5 from 'img/cards/CLUB-5.svg'
import Club6 from 'img/cards/CLUB-6.svg'
import Club7 from 'img/cards/CLUB-7.svg'
import Club8 from 'img/cards/CLUB-8.svg'
import Club9 from 'img/cards/CLUB-9.svg'
import Club10 from 'img/cards/CLUB-10.svg'
import Club11 from 'img/cards/CLUB-11-JACK.svg'
import Club12 from 'img/cards/CLUB-12-QUEEN.svg'
import Club13 from 'img/cards/CLUB-13-KING.svg'
import Diamond1 from 'img/cards/DIAMOND-1.svg'
import Diamond2 from 'img/cards/DIAMOND-2.svg'
import Diamond3 from 'img/cards/DIAMOND-3.svg'
import Diamond4 from 'img/cards/DIAMOND-4.svg'
import Diamond5 from 'img/cards/DIAMOND-5.svg'
import Diamond6 from 'img/cards/DIAMOND-6.svg'
import Diamond7 from 'img/cards/DIAMOND-7.svg'
import Diamond8 from 'img/cards/DIAMOND-8.svg'
import Diamond9 from 'img/cards/DIAMOND-9.svg'
import Diamond10 from 'img/cards/DIAMOND-10.svg'
import Diamond11 from 'img/cards/DIAMOND-11-JACK.svg'
import Diamond12 from 'img/cards/DIAMOND-12-QUEEN.svg'
import Diamond13 from 'img/cards/DIAMOND-13-KING.svg'
import Heart1 from 'img/cards/HEART-1.svg'
import Heart2 from 'img/cards/HEART-2.svg'
import Heart3 from 'img/cards/HEART-3.svg'
import Heart4 from 'img/cards/HEART-4.svg'
import Heart5 from 'img/cards/HEART-5.svg'
import Heart6 from 'img/cards/HEART-6.svg'
import Heart7 from 'img/cards/HEART-7.svg'
import Heart8 from 'img/cards/HEART-8.svg'
import Heart9 from 'img/cards/HEART-9.svg'
import Heart10 from 'img/cards/HEART-10.svg'
import Heart11 from 'img/cards/HEART-11-JACK.svg'
import Heart12 from 'img/cards/HEART-12-QUEEN.svg'
import Heart13 from 'img/cards/HEART-13-KING.svg'
import Spade1 from 'img/cards/SPADE-1.svg'
import Spade2 from 'img/cards/SPADE-2.svg'
import Spade3 from 'img/cards/SPADE-3.svg'
import Spade4 from 'img/cards/SPADE-4.svg'
import Spade5 from 'img/cards/SPADE-5.svg'
import Spade6 from 'img/cards/SPADE-6.svg'
import Spade7 from 'img/cards/SPADE-7.svg'
import Spade8 from 'img/cards/SPADE-8.svg'
import Spade9 from 'img/cards/SPADE-9.svg'
import Spade10 from 'img/cards/SPADE-10.svg'
import Spade11 from 'img/cards/SPADE-11-JACK.svg'
import Spade12 from 'img/cards/SPADE-12-QUEEN.svg'
import Spade13 from 'img/cards/SPADE-13-KING.svg'

import './Blackjack.scss'
import CardsHand from './CardsHand'
import Button from '../../_common/Button'
import BalanceItem from '../_common/BalanceItem'
import TextInput from '../_common/TextInput/TextInput'

const DEALER_CARDS = [
    {
        suit: 'spade',
        value: 11,
        image: Spade11,
    },
    {
        suit: 'spade',
        value: 3,
        image: Spade3,
    },
    {
        suit: 'heart',
        value: 5,
        image: Heart5,
    },
    {
        suit: 'diamond',
        value: 1,
        image: Heart1,
    },
]

const PLAYER_CARDS = [
    {
        suit: 'heart',
        value: 5,
        image: Spade11,
    },
    {
        suit: 'diamond',
        value: 1,
        image: Spade3,
    },
]

const DEALERS_CARDS_MESSAGE = '20 push'
const MIN_BET = 200000
const MAX_BET = 2000000

function BlackJack() {
    return (
        <Content color="black" className="blackjack">
            <div className="blackjack__board">
                <Masthead fullWidth>Blackjack</Masthead>
                <div className="blackjack__board__dealer-hand">
                    <CardsHand
                        cards={DEALER_CARDS}
                        message={DEALERS_CARDS_MESSAGE}
                    />
                </div>
                <div className="blackjack__board__buttons">
                    <Button color="white" styleType="primary">
                        Split
                    </Button>
                    <Button color="white" styleType="primary">
                        Stand
                    </Button>
                    <Button color="white" styleType="primary">
                        Hit
                    </Button>
                    <Button color="white" styleType="primary">
                        Double
                    </Button>
                </div>
            </div>
            <div className="blackjack__player">
                <h4>Your cards</h4>
                <CardsHand cards={PLAYER_CARDS} />
                <h4>Your current bet</h4>
                <Formik initialValues={{ bet: '' }}>
                    {(props) => (
                        <form
                            onSubmit={props.handleSubmit}
                            className={`wager-input`}
                        >
                            <Field
                                name="wager"
                                placeholder="Place a bet"
                                hasModifiers={true}
                                component={TextInput}
                            />
                            <button className="start-race">
                                {'Place Bet'}
                            </button>
                        </form>
                    )}
                </Formik>
                <p className="blackjack__player__min-max">{`MIN ${Numerals(
                    MIN_BET
                ).format('0.0 a', Math.floor)} / MAX ${Numerals(MAX_BET).format(
                    '0.0 a',
                    Math.floor
                )}`}</p>
            </div>
        </Content>
    )
}

export default BlackJack
