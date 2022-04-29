import React, { useState, useEffect } from 'react'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import Gangster from 'img/CharacterCreate/gangster.png'
import Assassin from 'img/CharacterCreate/assassin.png'
import Entrepreneur from 'img/CharacterCreate/entrepreneur.png'

import Ocean from 'img/map/Ocean.png'
import Modal from '../_common/Modal'
import Timer from 'img/map/timer.svg'
import Dollar from 'img/icons/dollar.svg'

import '../_common/Modal.scss'
import ProgressBar from '../_common/ProgressBar'
import RewardCard from './components/RewardCard'

const ANIMATION_TICKS = 50
const ANIMATION_INTERVAL = 100

const PROMOTION_CLAIM_MUTATION = gql`
    mutation ClaimPromotion($promotionId: ID!, $selection: Int!) {
        promotionClaim(promotionId: $promotionId, selection: $selection) {
            title
            rewards {
                type
                amount
                selected
            }
            player {
                id
                currencies {
                    name
                    amount
                }
                promotions {
                    id
                    title
                    levelName
                    startPoints
                    endPoints
                    showRewards
                    actionText
                    consumed
                }
            }
        }
    }
`

function PromotionModal({
    promotion,
    openPromotionModal,
    onCrossClick,
    character,
}) {
    const [promotionData, setPromotionData] = useState()
    const [mutateClaim, { data, loading }] = useMutation(
        PROMOTION_CLAIM_MUTATION
    )

    useEffect(() => {
        setPromotionData({
            data: !loading ? data : null,
            loading,
        })
    }, [data, loading])

    function claimPromotion(selection) {
        mutateClaim({
            variables: {
                promotionId: promotion.id,
                selection,
            },
        })
    }

    function handleClose() {
        setPromotionData(null)
        onCrossClick()
    }

    const claimTitle = promotionData?.data?.promotionClaim?.title
    const claimRewards = promotionData?.data?.promotionClaim?.rewards

    return (
        <Modal
            isOpen={openPromotionModal}
            className="promotion-modal-container"
            title="Promotion"
        >
            <div className="close-cross" onClick={handleClose}>
                X
            </div>
            <div className={`promotion-modal promotion-modal__${character}`}>
                <div className="text">
                    <p className="label">{promotion?.title}</p>
                    <p className="rank">{promotion?.levelName}</p>
                </div>
                {character === 'GANGSTER' && (
                    <img
                        alt="Gangster"
                        className="character-image"
                        src={Gangster}
                    />
                )}
                {character === 'ASSASSIN' && (
                    <img
                        alt="Assassin"
                        className="character-image"
                        src={Assassin}
                    />
                )}
                {character === 'ENTREPRENEUR' && (
                    <img
                        alt="Entrepreneur"
                        className="character-image"
                        src={Entrepreneur}
                    />
                )}
                <div className="progress-bar-container">
                    <ProgressBar
                        progress={promotion?.endPoints}
                        unit={promotion?.actionText}
                        label={promotion?.levelName}
                        min={promotion?.startPoints}
                        max={promotion?.endPoints}
                        className="animate-to-full"
                    />
                </div>
            </div>
            <h1>{claimTitle ? claimTitle : `Choose a reward`}</h1>
            {claimRewards ? (
                <article className={`rewards rewards__loaded`}>
                    {claimRewards.map((reward, key) => (
                        <RewardCard reward={reward} key={key} />
                    ))}
                </article>
            ) : (
                <article
                    className={`rewards rewards__${
                        loading ? 'loading' : 'loaded'
                    }`}
                >
                    <div
                        className="reward reward__tease"
                        onClick={() => claimPromotion(0)}
                    />
                    <div
                        className="reward reward__tease"
                        onClick={() => claimPromotion(1)}
                    />
                    <div
                        className="reward reward__tease"
                        onClick={() => claimPromotion(2)}
                    />
                </article>
            )}
        </Modal>
    )
}

export default PromotionModal
