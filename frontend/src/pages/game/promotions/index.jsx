import React, { useState } from 'react'

import './Promotions.scss'
import PromotionModal from './PromotionModal'
import { gql } from 'apollo-boost'
import { useQuery } from '@apollo/react-hooks'
import ArrowMenuItem from '../../_common/ArrowMenuItem/ArrowMenuItem'

const PROMOTIONS_QUERY = gql`
    query PromotionsQuery {
        viewer {
            player {
                id
                character
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

function Promotions() {
    const [openPromotion, setOpenPromotion] = useState()
    const { data } = useQuery(PROMOTIONS_QUERY, {
        fetchPolicy: 'network-only',
        pollInterval: 30000,
    })
    const character = data?.viewer?.player?.character
    const pendingPromotions = data?.viewer?.player?.promotions?.filter(
        (promotions) => promotions.consumed === false
    )
    const promotionsAvailable = pendingPromotions?.length ?? 0
    const promotionsOffer = promotionsAvailable >= 1

    function handlePromotionClick() {
        setOpenPromotion(pendingPromotions[0])
    }
    function handleCrossClick() {
        setOpenPromotion(null)
    }

    return (
        <>
            <PromotionModal
                promotion={openPromotion}
                openPromotionModal={!!openPromotion}
                onCrossClick={handleCrossClick}
                character={character}
            />
            {promotionsOffer && (
                <ArrowMenuItem
                    title={`New promotion${
                        promotionsAvailable !== 1 ? 's' : ''
                    }`}
                    description={`Choose a reward`}
                    count={promotionsAvailable}
                    countColor={`yellow`}
                    onClick={() => handlePromotionClick()}
                />
            )}
        </>
    )
}

export default React.memo(Promotions)
