import { gql } from 'apollo-boost'
import { useEffect } from 'react'
import { useMutation } from '@apollo/react-hooks'
import { useLocation } from 'react-router-dom'

const CLICK_STREAM_MUTATION = gql`
    mutation EventMutation($name: String!, $details: String!) {
        event(name: $name, details: $details)
    }
`

const PAGE_VIEW_CLICK_STREAM_NAME = 'PAGE_VIEW'

export default function useClickStreamPageViews() {
    const [mutateClickStream] = useMutation(CLICK_STREAM_MUTATION)
    const location = useLocation()

    function logToClickStream(name, details) {
        const detailsJson = JSON.stringify(details)

        mutateClickStream({
            variables: {
                name,
                details: detailsJson,
            },
        })
    }

    useEffect(() => {
        logToClickStream(PAGE_VIEW_CLICK_STREAM_NAME, {
            page: location.pathname,
            browser: {
                innerHeight: window.innerHeight,
                innerWidth: window.innerWidth,
                resHeight: window.screen.height,
                resWidth: window.screen.width,
            },
        })
    }, [location])
}
