import React from 'react'
import Content from '../../_common/Content/Content'
import Masthead from '../../_common/Masthead/Masthead'
import { gql } from 'apollo-boost'
import { useQuery } from '@apollo/react-hooks'
import ChangelogRow from './components/ChangelogRow'
import IntegratedLoader from '../_common/Loading/IntegratedLoader'

const CHANGELOG_QUERY = gql`
    query ChangelogPage {
        changelog {
            id
            title
            variant
            variantColor
            imageSrc
            content
            dateCreated
        }
        viewer {
            player {
                id
                unseenUpdates
            }
        }
    }
`

function Updates() {
    const { data } = useQuery(CHANGELOG_QUERY)

    return (
        <Content color="game">
            <Masthead fullWidth>News</Masthead>
            {data?.changelog ? (
                data?.changelog?.map((changelog, i) => {
                    return (
                        <ChangelogRow
                            key={changelog.id}
                            changelog={changelog}
                            initialExpansion={i === 0}
                        />
                    )
                })
            ) : (
                <IntegratedLoader />
            )}
        </Content>
    )
}

export default Updates
