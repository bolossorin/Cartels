import React from 'react'
import '../Crews.scss'
import { gql } from 'apollo-boost'
import { useQuery } from '@apollo/react-hooks'
import CrewItem from './../CrewItem'
import CrewsHeader from './../CrewsHeader'
import { useParams } from 'react-router'
import Tabs from './../Tabs'
import Applications from './Applications'
import CrewSettings from './Settings'
import Hierarchy from './Hierarchy'
import Members from './Members'
import Vault from './Vault'

export const MY_CREW_QUERY = gql`
    query myCrew {
        myCrew {
            crew {
                id
                name
                image
                crewType
                influence
                bio
                applications
                applicationQuestions
                selfApplication
                members {
                    id
                    name
                    role
                }
                hierarchy {
                    tier1 {
                        id
                        name
                        role
                    }
                    tier2 {
                        id
                        name
                        role
                    }
                    tier3 {
                        id
                        name
                        role
                    }
                }
            }
            members {
                member {
                    id
                    name
                    rank
                    role
                }
                canBeKicked
                hierarchyTier
            }
            canManageApplications
            canManageSettings
            canWithdrawVault
            canManageHeadquarters
            canSetTier1
            canSetTier2
            canSetTier3
            isFull
            vault
            canLeave
            applications {
                id
                dateCreated
                applicant {
                    id
                    name
                    rank
                    role
                }
                answers {
                    question
                    answer
                }
                votes {
                    hasVotedYes
                    hasVotedNo
                    yes {
                        id
                        name
                    }
                    no {
                        id
                        name
                    }
                }
            }
        }
        viewer {
            player {
                id
            }
        }
    }
`

const TABS = [
    {
        name: 'Members',
        url: '',
    },
    {
        name: 'Operations',
        url: 'operations',
    },
    {
        name: 'Vault',
        url: 'vault',
    },
    {
        name: 'Headquarters',
        url: 'headquarters',
    },
    {
        name: 'Applications',
        url: 'applications',
    },
    {
        name: 'Influence',
        url: 'influence',
    },
    {
        name: 'Hierarchy',
        url: 'hierarchy',
    },
    {
        name: 'Settings',
        url: 'settings',
    },
]

function CrewsList() {
    const { data } = useQuery(MY_CREW_QUERY)
    const { tab } = useParams()
    const crew = data?.myCrew?.crew
    const applications = data?.myCrew?.applications
    const canManageApplications = data?.myCrew?.canManageApplications
    const canManageSettings = data?.myCrew?.canManageSettings
    const isFull = data?.myCrew?.isFull
    const canSetTier1 = data?.myCrew?.canSetTier1
    const canSetTier2 = data?.myCrew?.canSetTier2
    const canSetTier3 = data?.myCrew?.canSetTier3
    const vault = data?.myCrew?.vault
    const canWithdrawVault = data?.myCrew?.canWithdrawVault
    const myCrewMembers = data?.myCrew?.members
    const crewType = crew?.crewType
    const canLeave = data?.myCrew?.canLeave
    const viewerId = data?.viewer?.player?.id

    return (
        <CrewsHeader
            title="My crew"
            linkButton={{ url: '/crews-list', text: 'Crews list' }}
        >
            <div className="crew-page">
                <CrewItem crew={crew} linkItem />
                <Tabs currentTab={tab} firstPartLink={'/my-crew'} tabs={TABS} />
                <div className="crew-content">
                    {tab === 'applications' && (
                        <Applications
                            applications={applications}
                            isFull={isFull}
                            canManageApplications={canManageApplications}
                        />
                    )}
                    {tab === 'settings' && (
                        <CrewSettings
                            canManageSettings={canManageSettings}
                            isFull={isFull}
                            crew={crew}
                        />
                    )}
                    {tab === 'hierarchy' && (
                        <Hierarchy
                            crew={crew}
                            canSetTier1={canSetTier1}
                            canSetTier2={canSetTier2}
                            canSetTier3={canSetTier3}
                        />
                    )}
                    {tab === 'vault' && (
                        <Vault
                            crew={crew}
                            canWithdrawVault={canWithdrawVault}
                            vault={vault}
                        />
                    )}
                    {['influence', 'headquarters', 'operations'].includes(
                        tab
                    ) && <span className="content-padding">Coming soon!</span>}
                    {!tab && (
                        <Members
                            myCrewMembers={myCrewMembers}
                            crewType={crewType}
                            canLeave={canLeave}
                            viewerId={viewerId}
                        />
                    )}
                </div>
            </div>
        </CrewsHeader>
    )
}

export default CrewsList
