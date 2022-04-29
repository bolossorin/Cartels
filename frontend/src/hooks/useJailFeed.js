import { gql } from 'apollo-boost'
import { useEffect, useState } from 'react'
import { useQuery } from '@apollo/react-hooks'

const JAIL_SEED_QUERY = gql`
    query JailFeedInitialSeeding {
        viewer {
            player {
                id
            }
        }
        jail {
            inmatesCount
            inmates {
                id
                player {
                    id
                    name
                    rank
                    character
                    role
                }
                crime
                description
                jailedAt
                releaseAt
                releaseIn
                callToAction
                special
                cellBlock
                bustable
            }
            bustAbility {
                canBustSelf
                canBustOthers
            }
        }
    }
`

const JAIL_FEED_SUBSCRIPTION = gql`
    subscription jailFeed {
        jailFeed {
            event
            inmate {
                id
                player {
                    id
                    name
                    rank
                    character
                    role
                }
                crime
                description
                jailedAt
                releaseAt
                releaseIn
                callToAction
                special
                cellBlock
                bustable
            }
            bustAbility {
                canBustSelf
                canBustOthers
            }
        }
    }
`

export default function useJailFeed() {
    const [feedData, setFeedData] = useState(null)
    const { data, error, loading, subscribeToMore } = useQuery(
        JAIL_SEED_QUERY,
        {
            fetchPolicy: 'network-only',
        }
    )

    useEffect(() => {
        if (!loading && error) {
            setFeedData({
                error,
            })
        }

        if (!loading && typeof data?.jail?.inmatesCount !== 'undefined') {
            setFeedData({
                count: data?.jail?.inmatesCount,
                inmates: data?.jail?.inmates,
                subbed: true,
            })

            if (!feedData?.subbed) {
                subscribeToMore?.({
                    document: JAIL_FEED_SUBSCRIPTION,
                    updateQuery: (prev, { subscriptionData }) => {
                        if (!subscriptionData.data) return prev

                        const feed = subscriptionData?.data?.jailFeed
                        const event = feed?.event
                        const inmate = feed?.inmate
                        const canBustSelf = feed?.bustAbility?.canBustSelf
                        const canBustOthers = feed?.bustAbility?.canBustOthers

                        let inmates = prev?.jail?.inmates ?? []

                        if (event === 'removedInmate') {
                            inmates = inmates.filter(
                                (currentInmate) =>
                                    currentInmate?.id !== inmate?.id
                            )
                        }
                        if (event === 'newInmate') {
                            inmates.push(inmate)
                        }

                        // Update bustable status
                        inmates = inmates.map((inmate) => {
                            const isSelf =
                                inmate.player.id === data?.viewer?.player?.id
                            const bustable =
                                (isSelf && canBustSelf) ||
                                (!isSelf && canBustOthers)

                            return {
                                ...inmate,
                                bustable,
                            }
                        })

                        return {
                            ...prev,
                            jail: {
                                ...prev?.jail,
                                inmatesCount: inmates.length,
                                inmates: inmates ?? null,
                            },
                        }
                    },
                })
            }
        }
    }, [JSON.stringify(data)])

    const selfRelease = feedData?.inmates?.find(
        (inmate) => inmate.player.id === data?.viewer?.player?.id
    )?.releaseIn

    return {
        loading: feedData === null,
        count: feedData?.count,
        error: feedData?.error,
        inmates: feedData?.inmates,
        selfRelease,
    }
}
