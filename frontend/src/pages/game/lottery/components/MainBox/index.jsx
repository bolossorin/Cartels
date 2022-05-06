import React from 'react'
import ImageCardBox from '../../../_common/ImageCardBox'
import ImgCard1 from 'img/scratch-n-match.png'
import ImgCard2 from 'img/big-heist.png'
import ImgCard3 from 'img/gold-pile.png'
import './MainBox.scss'

const MainBox = () => (
    <div className="main-box content-box">
        <div className="main-box__header">
            <h1>Lottery</h1>
        </div>
        <div className="main-box__content image-card-box">
            <ImageCardBox
                image={ImgCard1}
                title="Scratch'n'match"
                contentTop="Me and Money? It's a Match"
                contentBottom="Prizes from $ 1,000 to $ 200,000"
                price="$ 50,000"
            />
            <ImageCardBox
                image={ImgCard2}
                title="The Big Heist"
                contentTop="An empire in a snap!"
                contentBottom="Current pool $ 500,000,000"
                price="$ 50,000"
            />
            <ImageCardBox
                image={ImgCard3}
                title="Pile of Gold"
                contentTop="What are you gonna do?"
                contentBottom="Current Pool 42,240G"
                price="10 G"
            />
        </div>
    </div>
)

export default MainBox
