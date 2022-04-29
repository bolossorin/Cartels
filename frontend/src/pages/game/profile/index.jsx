import React, { useEffect, useState } from 'react'
import NoAvatar from 'img/default-avatar.png'
import JailedBars from 'img/in-jail.svg'

import './Profile.scss'
import NameTag from '../_common/NameTag'
import { useParams } from 'react-router'
import { Link } from 'react-router-dom'
import { useQuery } from '@apollo/react-hooks'
import IntegratedLoader from '../_common/Loading/IntegratedLoader'
import { gql } from 'apollo-boost'
import ProfileBio from './ProfileBio'
import ProfileEditBio from './ProfileEditBio'
import Content from '../../_common/Content/Content'
import Masthead from '../../_common/Masthead/Masthead'
import Button from '../../_common/Button'
import { prettyDate } from '../../../utils/prettyDate'
import CrewTag from '../crews/CrewTag'

const PROFILE_QUERY = gql`
    query ViewProfileQuery($name: String!) {
        viewer {
            player {
                id
            }
        }
        player(name: $name) {
            id
            name
            character
            rank
            wealth
            isJailed
            isOnline
            role
            bio
            dateActive
            dateCreated
            crew {
                id
                name
                crewType
            }
        }
    }
`

function Profile() {
    const [toggleEditBio, setToggleEditBio] = useState(false)
    const { playerName, tab } = useParams()
    const { data, loading, error } = useQuery(PROFILE_QUERY, {
        fetchPolicy: 'cache-and-network',
        variables: {
            name: playerName,
        },
    })
    const player = data?.player
    const canEditProfile = player?.id === data?.viewer?.player?.id && !loading

    if (!player) {
        return <IntegratedLoader text="Loading profile..." />
    }

    return (
        <Content color="game" className="profile">
            <Masthead fullWidth>
                Profile{' '}
                <div className="profile-header">
                    <Button
                        className="profile-header__invite"
                        color="blue"
                        styleType="secondary"
                    >
                        Invite to activity
                    </Button>
                    <Button
                        className="profile-header__friend"
                        color="white"
                        styleType="primary"
                    >
                        Friend
                    </Button>
                    <Button
                        className="profile-header__more"
                        color="white"
                        styleType="quaternary"
                    >
                        · · ·
                    </Button>
                </div>
            </Masthead>
            <div className="profile__info">
                <div className="profile__info__avatar">
                    <img src={NoAvatar} alt={`${player.name}'s avatar`} />
                </div>
                <div className="profile__info__text">
                    <NameTag player={player} />
                    <CrewTag crew={player?.crew} />
                    <p className="profile__info__text__rank">
                        {`Rank: ${player.rank}`}
                    </p>
                    <p className="profile__info__text__wealth">
                        {`Wealth status: ${player?.wealth ?? 'Unknown'}`}
                    </p>
                    <p>Joined {prettyDate(player?.dateCreated)}</p>
                    <p>Active {prettyDate(player?.dateActive)}</p>
                </div>
            </div>
            {toggleEditBio && (
                <ProfileEditBio
                    canEditProfile={canEditProfile}
                    player={player}
                    setToggleEditBio={setToggleEditBio}
                />
            )}
            {!toggleEditBio && (
                <ProfileBio
                    canEditProfile={canEditProfile}
                    player={player}
                    setToggleEditBio={setToggleEditBio}
                />
            )}
        </Content>
    )
}

export default Profile
