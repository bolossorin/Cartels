import { gql } from 'apollo-boost'
import { useMutation } from '@apollo/react-hooks'
import { collectPerformanceMetadata } from '../utils/formMetadata'

const FORM_META_MUTATION = gql`
    mutation EventMutation($name: String!, $details: String!) {
        event(name: $name, details: $details)
    }
`

const FORM_META_CLICK_STREAM_NAME = 'FORM_META'

export default function useClickStreamFormMeta() {
    const [mutateClickStream] = useMutation(FORM_META_MUTATION)

    function logToClickStream(name, details) {
        const detailsJson = JSON.stringify(details)

        mutateClickStream({
            variables: {
                name,
                details: detailsJson,
            },
        })
    }

    return (formName) => {
        const formMeta = collectPerformanceMetadata(formName)

        logToClickStream(FORM_META_CLICK_STREAM_NAME, {
            page: document.location.pathname,
            browser: {
                innerHeight: window.innerHeight,
                innerWidth: window.innerWidth,
                resHeight: window.screen.height,
                resWidth: window.screen.width,
            },
            formMeta,
        })
    }
}
