import React from 'react'
import { Link } from 'react-router-dom'
import './Forums.scss'
import Content from '../../_common/Content/Content'
import ForumsItem from './ForumsItem'
import Back from 'img/icons/back.svg'
import { useParams } from 'react-router'
import { gql } from 'apollo-boost'
import { useMutation, useQuery } from '@apollo/react-hooks'
import IntegratedLoader from '../_common/Loading/IntegratedLoader'
import { Field, Form, Formik } from 'formik'
import Textarea from '../../_common/Textarea'
import SendMessage from 'img/forums/send-message.svg'
import LeftArrow from 'img/forums/left-arrow.svg'
import RightArrow from 'img/forums/right-arrow.svg'
import useClickStreamFormMeta from '../../../hooks/useClickStreamFormMeta'
import Input from '../../_common/Input'
import Button from '../../_common/Button'
import ReactPaginate from 'react-paginate'
import Masthead from '../../_common/Masthead/Masthead'
import { crewNameComplement } from '../crews/crewUtils'

const FORUM_THREADS = gql`
    query forumThreads(
        $input: ForumThreadsInput!
        $forumCategoryInput: GetForumCategoryInput!
    ) {
        viewer {
            player {
                id
                role
                crew {
                    id
                    name
                    crewType
                }
            }
        }
        getForumCategory(input: $forumCategoryInput) {
            id
            isStaffRestricted
        }
        forumThreads(input: $input) {
            threads {
                id
                name
                isLocked
                isAnnouncement
                isHidden
                isPinned
                dateUpdated
                dateCreated
                dateReplied
                repliesCount
            }
            selectedPage
            pages
        }
    }
`

const POST_THREAD = gql`
    mutation PostThread($input: CreateForumThreadInput!) {
        createForumThread(input: $input) {
            threads {
                id
                name
                isLocked
                isAnnouncement
                isHidden
                isPinned
                dateUpdated
                dateCreated
                repliesCount
            }
            selectedPage
            pages
        }
    }
`

function unSlugName(name) {
    const s = name.replace(/-/g, ' ')

    return s.charAt(0).toUpperCase() + s.slice(1)
}

function ForumsThreads() {
    const sendFormMeta = useClickStreamFormMeta()
    const { category } = useParams()
    const [mutateThread] = useMutation(POST_THREAD)
    const { data, refetch, loading, networkStatus, updateQuery } = useQuery(
        FORUM_THREADS,
        {
            notifyOnNetworkStatusChange: true,
            variables: {
                input: {
                    categoryName: category,
                    page: 1,
                },
                forumCategoryInput: {
                    categorySlug: category,
                },
            },
            fetchPolicy: 'network-only',
        }
    )

    const playerRole = data?.viewer?.player?.role
    const crew = data?.viewer?.player?.crew
    const staffRestricted = data?.getForumCategory?.isStaffRestricted
    const postRestricted =
        staffRestricted && !['MODERATOR', 'ADMINISTRATOR'].includes(playerRole)
    const threads = data?.forumThreads?.threads

    const viewerIsNotStaff = !['MODERATOR', 'ADMINISTRATOR'].includes(
        playerRole
    )

    async function handlePost(values, actions) {
        sendFormMeta('forum-post')

        const content = values?.content
        if (!content || content.length === 0) {
            actions.setErrors({
                content: `Please enter a valid message in your post.`,
            })
            return
        }
        if (content.length > 4000) {
            actions.setErrors({
                content: `You currently have ${content.length} characters which exceeds the maximum of 4,000.`,
            })
            return
        }

        const title = values?.title
        if (!title || title.length === 0) {
            actions.setErrors({
                title: `Please enter a valid title in your post.`,
            })
            return
        }
        if (title.length > 70) {
            actions.setErrors({
                title: `You currently have ${title.length} characters which exceeds the maximum of 70.`,
            })
            return
        }

        let result
        try {
            result = await mutateThread({
                variables: {
                    input: {
                        categorySlug: category,
                        title,
                        content,
                    },
                },
            })

            updateQuery((existingCache) => {
                return {
                    forumThreads: result.data.createForumThread,
                }
            })

            actions.resetForm()
        } catch (e) {
            const errorMessage = e?.graphQLErrors?.[0]?.message

            actions.setErrors({
                title: errorMessage,
            })
        }
    }

    const selectedPage = data?.forumThreads?.selectedPage
    const pages = data?.forumThreads?.pages

    async function handlePageChange({ selected }) {
        return await refetch({
            input: {
                categoryName: category,
                page: selected + 1,
            },
        })
    }

    const displayedCrewName = `${crew?.name}${crewNameComplement(
        crew?.crewType
    )}`

    return (
        <Content color="game" className="forums">
            <Masthead fullWidth>
                <Link to="/forums">
                    <img src={Back} alt="back to forums" />
                </Link>{' '}
                {category === 'crew' ? displayedCrewName : unSlugName(category)}
            </Masthead>
            {threads && (
                <ReactPaginate
                    previousLabel={<img src={LeftArrow} alt="previous page" />}
                    nextLabel={<img src={RightArrow} alt="next page" />}
                    breakLabel={'...'}
                    breakClassName={'break-me'}
                    initialPage={selectedPage - 1}
                    pageCount={pages ?? 1}
                    forcePage={selectedPage - 1}
                    marginPagesDisplayed={2}
                    pageRangeDisplayed={5}
                    onPageChange={handlePageChange}
                    containerClassName={
                        'forum-pagination forum-pagination--category'
                    }
                    subContainerClassName={'pages pagination'}
                    activeClassName={'active'}
                />
            )}
            <div className="forum-threads">
                {!threads && <IntegratedLoader />}
                {threads?.map((thread) => (
                    <ForumsItem
                        key={thread?.id}
                        url={`${category}/${thread?.id}`}
                        name={thread?.name}
                        dateCreated={thread.dateCreated}
                        dateUpdated={thread.dateUpdated}
                        dateReplied={thread.dateReplied}
                        thread={thread}
                        stat={`${thread.repliesCount} replies`}
                    />
                ))}
            </div>
            <div className="forum-thread-create">
                {postRestricted === false && (
                    <Formik
                        initialValues={{
                            title: '',
                            content: '',
                        }}
                        onSubmit={handlePost}
                    >
                        {(props) => (
                            <Form name="forum-post">
                                <Field
                                    name="title"
                                    placeholder="Create a title for your thread"
                                    component={Input}
                                />
                                <Field
                                    name="content"
                                    placeholder="Type a message"
                                    component={Textarea}
                                />
                                <Field
                                    component={Button}
                                    styleType="primary"
                                    color="blue"
                                    name="registerButton"
                                >
                                    Create thread
                                </Field>
                            </Form>
                        )}
                    </Formik>
                )}
            </div>
        </Content>
    )
}

export default ForumsThreads
