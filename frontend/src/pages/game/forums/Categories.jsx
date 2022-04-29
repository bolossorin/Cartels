import React from 'react'

import './Forums.scss'
import Content from '../../_common/Content/Content'
import ForumsItem from './ForumsItem'
import { gql } from 'apollo-boost'
import { useQuery } from '@apollo/react-hooks'
import Masthead from '../../_common/Masthead/Masthead'
import { crewNameComplement } from '../crews/crewUtils'

const FORUM_CATEGORIES = gql`
    query forumCategories {
        forumCategories {
            id
            name
            slug
            threadsCount
            description
        }
        viewer {
            player {
                id
                crew {
                    id
                    name
                    crewType
                }
            }
        }
    }
`

function slugName(name) {
    return name.replace(/ /g, '-').toLowerCase()
}

function ForumsCategories() {
    const { data } = useQuery(FORUM_CATEGORIES)
    const categories = data?.forumCategories
    const viewer = data?.viewer?.player
    const displayedCrewName = `${viewer?.crew?.name}${crewNameComplement(
        viewer?.crew?.crewType
    )}`

    return (
        <Content color="game" className="forums">
            <Masthead fullWidth>Forums</Masthead>
            <div className="forum-categories">
                {categories?.map((category) => (
                    <ForumsItem
                        key={category.name}
                        url={`/forums/${category.slug}`}
                        name={
                            category.slug === 'crew'
                                ? displayedCrewName
                                : category.name
                        }
                        stat={`${category.threadsCount} threads`}
                        description={category?.description}
                    />
                ))}
            </div>
        </Content>
    )
}

export default ForumsCategories
