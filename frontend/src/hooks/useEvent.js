import React from 'react'
import { useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

const CUSTOM_EVENT_MUTATION = gql`
    mutation CustomEventMutation($name: String!, $details: String!) {
        event(name: $name, details: $details)
    }
`

export default function useEvent() {
    const [mutateClickStream] = useMutation(CUSTOM_EVENT_MUTATION)

    function logToClickStream(name, details) {
        const detailsJson = JSON.stringify(details)

        mutateClickStream({
            variables: {
                name,
                details: detailsJson,
            },
        })
    }

    return ({ name, details }) => {
        logToClickStream(name, {
            page: document.location.pathname,
            browser: {
                innerHeight: window.innerHeight,
                innerWidth: window.innerWidth,
                resHeight: window.screen.height,
                resWidth: window.screen.width,
            },
            ...(details ?? {}),
        })
    }
}
