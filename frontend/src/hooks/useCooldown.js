import { gql } from 'apollo-boost'
import { useEffect, useState } from 'react'
import { useSubscription } from '@apollo/react-hooks'

const COOLDOWN_FEED_SUBSCRIPTION = gql`
    subscription CooldownFeedHook {
        cooldownFeed {
            eventSource
            cooldowns {
                name
                expiresAt
                startedAt
            }
        }
    }
`

function isResting(expiresAt) {
    return new Date(expiresAt) - window.ESCOBAR.getTime() > 0
}

export default function useCooldown(cooldownName, excludeJail) {
    const [appliedCooldowns, setAppliedCooldowns] = useState(null)
    const { data } = useSubscription(COOLDOWN_FEED_SUBSCRIPTION)

    useEffect(() => {
        const interval = setInterval(() => {
            if (appliedCooldowns) {
                const validCooldowns = appliedCooldowns.filter((cooldown) => {
                    const diff =
                        new Date(cooldown.expiresAt) - window.ESCOBAR.getTime()

                    return diff >= 1250
                })

                if (appliedCooldowns.length !== validCooldowns.length) {
                    setAppliedCooldowns(validCooldowns)
                }
            }
        }, 250)

        return () => clearInterval(interval)
    }, [appliedCooldowns])

    useEffect(() => {
        const applicableCooldowns = [cooldownName]
        if (!excludeJail) {
            applicableCooldowns.push('jail')
        }

        const cooldowns = data?.cooldownFeed?.cooldowns
        const appliedCooldowns = []
        if (cooldowns) {
            for (const cooldown of cooldowns) {
                if (
                    applicableCooldowns.includes(cooldown.name) &&
                    isResting(cooldown.expiresAt)
                ) {
                    appliedCooldowns.push({
                        name: cooldown.name,
                        expiresAt: cooldown.expiresAt,
                        startedAt: cooldown.startedAt,
                    })
                }
            }
        }

        appliedCooldowns.sort(
            (a, b) => new Date(b.expiresAt) - new Date(a.expiresAt)
        )
        setAppliedCooldowns(appliedCooldowns)
    }, [data, cooldownName])

    return appliedCooldowns ? appliedCooldowns[0] : null
}
