import React from 'react'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'
import CrewIcon from '../_common/CrewIcon'
import TimerIcon from 'img/icons/Time.png'
import GreyStar from 'img/icons/star-grey.png'
import BlueStar from 'img/jail/Star-blue.svg'
import YellowStar from 'img/jail/Star-yellow.svg'
import RedStar from 'img/jail/Star-red.svg'
import PurpleStar from 'img/jail/Star-purple.svg'
import IcoDollars from 'img/icons/dollar.svg'
import Ticker from '../_common/Ticker'
import NameTag from '../_common/NameTag'
import Button from '../../_common/Button'
import TickManager from '../_common/TickManager'

const VIEWER_QUERY = gql`
    query PlayerQuery {
        viewer {
            player {
                id
                name
            }
        }
    }
`

const Inmate = ({ inmate, handleBust, disabled, loading }) => {
    const { data } = useQuery(VIEWER_QUERY, {
        fetchPolicy: 'cache-only',
    })
    const viewer = data?.viewer?.player

    const {
        id,
        crime,
        description,
        jailedAt,
        releaseAt,
        special,
        cellBlock,
        player,
        bustable,
        callToAction,
    } = inmate

    function getImage(cellBlock) {
        if (cellBlock === 'GITMO') {
            return PurpleStar
        }
        if (cellBlock === 'MAXIMUM') {
            return RedStar
        }
        if (cellBlock === 'MEDIUM') {
            return YellowStar
        }

        return BlueStar
    }

    function getColor(cellBlock) {
        if (cellBlock === 'GITMO') {
            return 'purple'
        }
        if (cellBlock === 'MAXIMUM') {
            return 'red'
        }
        if (cellBlock === 'MEDIUM') {
            return 'yellow'
        }

        return 'blue'
    }

    const disableButton = disabled || !bustable || loading

    return (
        <div
            className={`inmate ${
                viewer.name === player.name ? 'inmate--own' : ''
            }`}
        >
            <div className="inmate__info">
                <div className="inmate__info__star">
                    <img src={getImage(cellBlock)} alt={cellBlock} />
                </div>
                <div className="inmate__info__id">
                    <NameTag player={player} />
                    <p
                        className={`inmate__info__id__rank ${
                            special ? 'inmate__info__id__rank--special' : ''
                        }`}
                    >
                        {special ? special : player.rank}
                    </p>
                </div>
                <div className="inmate__info__crime">
                    <h4>{crime}</h4>
                    <p>{description}</p>
                </div>
            </div>
            <div className="inmate__timer-button">
                <div className="inmate__timer-button__timer">
                    <p>
                        {' '}
                        <TickManager
                            dateStart={jailedAt}
                            dateEnd={releaseAt}
                            onExpiry={() => {}}
                        >
                            {({ pretty }) => <>{pretty}</>}
                        </TickManager>
                    </p>
                    <img src={TimerIcon} alt="timer" />
                </div>
                <Button
                    styleType="primary"
                    color={`${getColor(cellBlock)}`}
                    disabled={disableButton}
                    loading={loading}
                    onClick={() => handleBust(inmate)}
                >
                    {callToAction}
                </Button>
            </div>
        </div>
    )
}

export default Inmate
