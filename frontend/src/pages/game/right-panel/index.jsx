import React from 'react'
import Content from '../../_common/Content/Content'
import MiniMap from './components/MiniMap'
import Promotions from '../promotions'
import ArrowMenuItem from '../../_common/ArrowMenuItem/ArrowMenuItem'
import Button from '../../_common/Button'
import { Link } from 'react-router-dom'
import Text from '../../_common/Text/Text'

import MiniDiscord from 'assets/images/mini_discord.svg'
import BlueHelp from 'assets/images/blue-help.svg'
import './RightPanel.scss'
import { gql } from 'apollo-boost'
import { useQuery } from '@apollo/react-hooks'
import Perks from '../perks'
import { LIGHTSPEED_MODE } from '../../../config'

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

function RightPanel() {
    const { data } = useQuery(UNSEEN_UPDATES, {
        fetchPolicy: 'cache-and-network',
        pollInterval: 120000,
    })

    const unseenUpdates = data?.viewer?.player?.unseenUpdates
    const lightspeedMode = localStorage.getItem(LIGHTSPEED_MODE) === 'yes'

    return (
        <>
            <div className="column-1 right-panel">
                <MiniMap />
                <Perks />
                <Content color={`game`}>
                    <ArrowMenuItem
                        title={`News`}
                        count={unseenUpdates >= 1 ? unseenUpdates : undefined}
                        countColor={unseenUpdates ? `blue` : undefined}
                        src={`/news`}
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
                    <a
                        href="https://discord.gg/5Xe845M"
                        target="_blank"
                        className="link-button-wrapper"
                    >
                        <Button
                            type={`secondary`}
                            color={`blue`}
                            className={`discord-button`}
                        >
                            Join
                        </Button>
                    </a>
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
        </>
    )
}

export default RightPanel
