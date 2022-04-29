import React, { useState } from 'react'
import ForumsBox from '../ForumsBox'
import RightNavLinks from '../RightNavLinks'
import MenuArrow from 'img/icons/back.svg'
import MiniMap from '../components/MiniMap'
import { Link } from 'react-router-dom'
import './RightPanelMobile.scss'
import Content from '../../../_common/Content/Content'
import ArrowMenuItem from '../../../_common/ArrowMenuItem/ArrowMenuItem'
import Promotions from '../../promotions'
import Text from '../../../_common/Text/Text'
import Button from '../../../_common/Button'
import MiniDiscord from 'assets/images/mini_discord.svg'
import BlueHelp from 'assets/images/blue-help.svg'
import { gql } from 'apollo-boost'
import { useQuery } from '@apollo/react-hooks'
import Perks from '../../perks'

const UNSEEN_UPDATES = gql`
    query RightPanelUnseenUpdates {
        viewer {
            player {
                id
                unseenUpdates
            }
        }
    }
`

const MobileRightPanel = ({ player }) => {
    const { data } = useQuery(UNSEEN_UPDATES, {
        fetchPolicy: 'cache-and-network',
        pollInterval: 120000,
    })

    const [expanded, setExpanded] = useState(false)

    const handleToggleExpand = (event) => {
        event.preventDefault()

        setExpanded(!expanded)
    }

    const unseenUpdates = data?.viewer?.player?.unseenUpdates

    return (
        <div
            className={`right-panel-mobile-container ${
                expanded ? 'right-panel-mobile-container__open' : ''
            }`}
        >
            <div className="left-right-panel-mobile">
                <MiniMap />
                <Perks />
                <Content onClick={handleToggleExpand}>
                    <ArrowMenuItem
                        title={`News`}
                        src={`/news`}
                        count={unseenUpdates >= 1 ? unseenUpdates : undefined}
                        countColor={unseenUpdates ? `blue` : undefined}
                    />
                    <Promotions />
                    <ArrowMenuItem title={`Forums`} src={`/forums`} />
                    <ArrowMenuItem
                        title={
                            <>
                                Discord{' '}
                                <img
                                    src={MiniDiscord}
                                    alt={`Discord community server`}
                                />
                            </>
                        }
                    />
                    <Text annotationGrey className={`discord-text`}>
                        Join our community Discord server to make some friends
                        and organise together.
                    </Text>
                    <Button
                        type={`secondary`}
                        color={`blue`}
                        className={`discord-button`}
                    >
                        Join
                    </Button>
                    <div className={`rules`}>
                        <Link to={`/rules`} className={`rules-link`}>
                            Rules and Privacy Policy
                            <img
                                src={BlueHelp}
                                alt={`Rules and privacy policy`}
                            />
                        </Link>
                    </div>
                </Content>
            </div>
            <a className="pull-menu-arrow" href="" onClick={handleToggleExpand}>
                <img src={MenuArrow} />
            </a>
        </div>
    )
}

export default MobileRightPanel
