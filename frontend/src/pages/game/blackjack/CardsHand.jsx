import React, { useEffect, useState } from 'react'

import './CardsHand.scss'

function CardsHand({ cards, message }) {
    return (
        <div className="cards-hand">
            <div className="cards-hand__cards">
                {cards?.map((card) => (
                    <div className="cards-hand__cards__card">
                        <img
                            key={card.suit + card.value}
                            src={card.image}
                            alt={`${card.value} of ${card.suit}`}
                        />
                    </div>
                ))}
            </div>
            {message && <h4 className="cards-hand__message">{message}</h4>}
        </div>
    )
}

export default CardsHand
