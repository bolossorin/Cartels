import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Route } from 'react-router-dom'
import { ApolloClient, gql, HttpLink, InMemoryCache } from 'apollo-boost'
import { ApolloProvider } from '@apollo/react-hooks'
import { onError } from 'apollo-link-error'
import { createHttpLink } from 'apollo-link-http'
import { setContext } from 'apollo-link-context'
import { WebSocketLink } from 'apollo-link-ws'
import { split, from } from 'apollo-link'
import { getMainDefinition } from 'apollo-utilities'
import App from './pages/App'
import { AUTH_TOKEN } from './config'
import { getCLS, getFID, getLCP, getTTFB, getFCP } from 'web-vitals'

import './styles/index.scss'

function randomChar() {
    return (
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15)
    )
}

function getBuildId() {
    const scripts = document.getElementsByTagName('script')
    for (let i = 0; i < scripts.length; i++) {
        if (scripts[i].src.includes('main.')) {
            const matches = /\w*\.js/gm.exec(scripts[i].src)
            const build = matches[0].replace('.js', '')

            console.log(`🤖 BUILD: ${build}`)

            return build
        }
    }

    console.log(`🤖 BUILD: unknown`)

    return null
}

window.ESCOBAR = {
    API: '/api/graphql',
    clid: randomChar(),
    build: getBuildId(),
}
const origin = document.location.origin || ''

if (origin.includes('staging')) {
    window.ESCOBAR.API = 'https://yippee-ki-yay.cartels.com/api/graphql'
    window.ESCOBAR.env = 'staging'
}
if (origin.includes('prod') || origin.includes('www')) {
    window.ESCOBAR.env = 'prod'
    if (origin.includes('cartels.com')) {
        window.ESCOBAR.API = 'https://game.cartels.com/api/graphql'
    } else {
        window.ESCOBAR.API =
            origin.replace('prod', 'api.prod').replace('www', 'api') +
            window.ESCOBAR.API
    }
}
if (origin.includes('localhost')) {
    window.ESCOBAR.env = 'local'
    window.ESCOBAR.API = origin + window.ESCOBAR.API
}

function syncClock() {
    return new Promise((resolve, reject) => {
        const benchStart = new Date()
        fetch(
            `${window.ESCOBAR.API.replace(
                'graphql',
                `v1/clockSync?a=${window.ESCOBAR.clid}&b=${window.ESCOBAR.build}`
            )}`
        )
            .then((result) => result.json())
            .then((result) => {
                const benchTime = Math.abs(new Date().getTime() - benchStart)
                const lagAllowance = benchTime / 2

                const clock = new Date(result?.clock)
                const clockDiff = Math.abs(new Date().getTime() - clock)

                const serverTimeDiff = clockDiff - lagAllowance

                console.log(`API Ping: ${benchTime / 1000}ms`)
                window.ESCOBAR.serverPing = benchTime / 1000
                window.ESCOBAR.serverTimeDiff = serverTimeDiff
                window.ESCOBAR.clientOffset =
                    new Date().getTimezoneOffset() * -1

                resolve()
            })
            .catch(() => {
                reject()
            })
    })
}

function generateEscobarTime(attempt = 1) {
    if (attempt > 2) {
        console.log('Could not sync time with server.')

        return
    }

    syncClock().catch((e) => {
        if (navigator.onLine) {
            console.log('Retrying ')
            generateEscobarTime(attempt + 1)
        }
    })
}

window.ESCOBAR.getTime = () => {
    const date = new Date()
    date.setTime(date.getTime() + (window.ESCOBAR?.serverTimeDiff ?? 0))

    return date
}

function syncEscobarTime() {
    generateEscobarTime()

    setTimeout(() => {
        generateEscobarTime()
    }, 1500)

    setTimeout(() => {
        generateEscobarTime()
    }, 7500)

    setTimeout(() => {
        generateEscobarTime()
    }, 15000)

    setInterval(() => {
        const timeChanged =
            window.ESCOBAR.clientOffset !== new Date().getTimezoneOffset() * -1

        if (
            navigator.onLine &&
            timeChanged &&
            'clientOffset' in window.ESCOBAR
        ) {
            console.log('Detected client time change, resyncing...', {
                current: window.ESCOBAR.clientOffset,
                now: new Date().getTimezoneOffset() * -1,
            })
            window.ESCOBAR.serverTimeResync =
                (window.ESCOBAR?.serverTimeResync ?? 0) + 1

            generateEscobarTime()
        }
    }, 30000)
}

syncEscobarTime()

const httpLink = createHttpLink({
    uri: window.ESCOBAR.API,
})

const authLink = setContext((_, { headers }) => {
    const token = localStorage.getItem(AUTH_TOKEN)
    return {
        headers: {
            ...headers,
            'paragon-sig-a': token ?? '',
            'paragon-c-a': window?.ESCOBAR?.clid ?? '',
            'paragon-c-b': window?.ESCOBAR?.build ?? '',
            'idempotency-key': randomChar(),
        },
    }
})

const errorLink = onError(
    ({ graphQLErrors, networkError, operation, forward }) => {
        if (graphQLErrors) {
            for (let err of graphQLErrors) {
                console.log({ err })
                if (
                    err?.code === 'UNAUTHENTICATED' &&
                    !err.message.includes('player account')
                ) {
                    const oldHeaders = operation.getContext().headers
                    if (oldHeaders?.['paragon-sig-a'] !== '') {
                        localStorage.removeItem(AUTH_TOKEN)

                        operation.setContext({
                            headers: {
                                ...oldHeaders,
                                'paragon-sig-a': '',
                            },
                        })

                        return forward(operation)
                    }
                }

                return
            }
        }

        return forward(operation)
    }
)

const websocketProtocol = origin.includes('localhost') ? 'ws' : 'wss'

const pubsubUrl =
    window.ESCOBAR.API.replace('https', websocketProtocol).replace(
        'http',
        websocketProtocol
    ) + '/pubsub'

const wsLink = new WebSocketLink({
    uri: pubsubUrl,
    options: {
        reconnect: true,
        // inactivityTimeout: 360,
        // timeout: 360,
        connectionParams: () => ({
            subClientId: 'frontend:v1.3',
            subAuthToken: localStorage.getItem(AUTH_TOKEN),
            subClid: window?.ESCOBAR?.clid ?? '',
            subBuild: window?.ESCOBAR?.build ?? '',
            subIdempotency: randomChar(),
        }),
    },
})

// const alwaysUseWs = localStorage.getItem(LIGHTSPEED_MODE)
const alwaysUseWs = false

const link = split(
    // split based on operation type
    ({ query }) => {
        if (alwaysUseWs === 'yes') {
            return true
        }

        const definition = getMainDefinition(query)

        return (
            (definition.kind === 'OperationDefinition' &&
                definition.operation === 'subscription') ||
            [
                'CustomEventMutation',
                'EventMutation',
                'AnalyticsMutation',
            ].includes(definition.name?.value)
        )
    },
    wsLink,
    httpLink
)

const apolloClient = new ApolloClient({
    link: from([authLink, errorLink, link]),
    cache: new InMemoryCache(),
})

const ANALYTICS_EVENT_MUTATION = gql`
    mutation AnalyticsMutation($name: String!, $details: String!) {
        event(name: $name, details: $details)
    }
`

function sendToAnalytics(metric) {
    const body = JSON.stringify({
        [metric.name]: metric.value,
        clid: window.ESCOBAR.clid,
        build: window.ESCOBAR.build,
        page: document.location.pathname,
        browser: {
            innerHeight: window.innerHeight,
            innerWidth: window.innerWidth,
            resHeight: window.screen.height,
            resWidth: window.screen.width,
        },
    })
    apolloClient.mutate({
        mutation: ANALYTICS_EVENT_MUTATION,
        variables: {
            name: 'PERFORMANCE',
            details: body,
        },
    })
}

getCLS(sendToAnalytics)
getFID(sendToAnalytics)
getLCP(sendToAnalytics)
getTTFB(sendToAnalytics)
getFCP(sendToAnalytics)

// Report frontend performance
setTimeout(() => {
    const fields = [
        'hardwareConcurrency',
        'deviceMemory',
        'language',
        'platform',
        'connection',
    ]

    const collateMetadata = () => {
        const meta = {}
        fields.forEach((field) => {
            meta[field] = navigator?.[field] ?? null
        })

        return meta
    }

    const connection =
        navigator.connection ||
        navigator.mozConnection ||
        navigator.webkitConnection

    const body = JSON.stringify({
        usage: {
            navigator: collateMetadata(),
            screen: {
                orientation: window?.screen?.orientation?.type,
                pixelDepth: window?.screen?.pixelDepth,
            },
            connection: {
                effectiveType: connection?.effectiveType,
                saveData: connection?.saveData,
                downlink: connection?.downlink,
            },
            capabilities: {
                beacon: 'sendBeacon' in navigator,
                websocket: 'WebSocket' in window,
            },
            time: {
                offset: new Date().getTimezoneOffset(),
                now: new Date().toJSON(),
            },
        },
        clid: window.ESCOBAR.clid,
        build: window.ESCOBAR.build,
        page: document.location.pathname,
        browser: {
            innerHeight: window.innerHeight,
            innerWidth: window.innerWidth,
            resHeight: window.screen.height,
            resWidth: window.screen.width,
        },
    })
    apolloClient.mutate({
        mutation: ANALYTICS_EVENT_MUTATION,
        variables: {
            name: 'META',
            details: body,
        },
    })
}, 1500)

ReactDOM.render(
    <ApolloProvider client={apolloClient}>
        <BrowserRouter>
            <Route component={App} />
        </BrowserRouter>
    </ApolloProvider>,
    document.getElementById('root')
)

if (process.env.NODE_ENV === 'development') {
    console.log('Frontend running in development mode')

    if (module.hot) module.hot.accept()
    if (module.hot) console.log('Frontend running in hot reload mode')
}
