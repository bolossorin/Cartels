import React, { useEffect, useState } from 'react'
import SendMessage from 'img/forums/send-message.svg'
import ForumThreadReply from './ForumThreadReply'
import IntegratedLoader from '../_common/Loading/IntegratedLoader'
import LeftArrow from 'img/forums/left-arrow.svg'
import RightArrow from 'img/forums/right-arrow.svg'
import Locked from 'img/forums/locked.svg'
import { gql } from 'apollo-boost'
import { useMutation, useQuery } from '@apollo/react-hooks'
import ReactPaginate from 'react-paginate'

import './Forums.scss'
import { Field, Form, Formik } from 'formik'
import useClickStreamFormMeta from '../../../hooks/useClickStreamFormMeta'
import Textarea from '../../_common/Textarea'
import { setToken } from '../../../utils/auth'
import Input from '../../_common/Input'
import Button from '../../_common/Button'

export const REPLIES = gql`
    query ForumReplies($input: ForumRepliesInput!) {
        forumReplies(input: $input) {
            replies {
                id
                player {
                    id
                    name
                    role
                }
                content
                dateCreated
                dateEdited
                isHidden
                permissions {
                    canEdit
                    canDelete
                    canHide
                }
            }
            selectedPage
            pages
        }
        viewer {
            player {
                id
                role
            }
        }
    }
`

const DELETE_REPLY = gql`
    mutation deleteForumReply($input: DeleteForumReplyInput!) {
        deleteForumReply(input: $input) {
            replies {
                id
                player {
                    id
                    name
                    role
                }
                content
                dateCreated
                dateEdited
                isHidden
                permissions {
                    canEdit
                    canDelete
                    canHide
                }
            }
            selectedPage
            pages
        }
    }
`

const POST_REPLY = gql`
    mutation PostReplyFromThread($input: CreateForumReplyInput!) {
        createForumReply(input: $input) {
            replies {
                id
                player {
                    id
                    name
                    role
                }
                content
                dateCreated
                dateEdited
                isHidden
                permissions {
                    canEdit
                    canDelete
                    canHide
                }
            }
            selectedPage
            pages
        }
    }
`

function ForumThreadReplies({ threadId, isLocked }) {
    const sendFormMeta = useClickStreamFormMeta()
    const [deletePostMutationData, setDeletePostMutationData] = useState(
        undefined
    )
    const [mutateReply] = useMutation(POST_REPLY)
    const [mutateDeleteReply, { data: mutationData, reset }] = useMutation(
        DELETE_REPLY
    )
    const { data, refetch, loading, networkStatus, updateQuery } = useQuery(
        REPLIES,
        {
            notifyOnNetworkStatusChange: true,
            variables: {
                input: {
                    threadId: threadId,
                    page: 1,
                },
            },
        }
    )

    const isRefetching = networkStatus === 4 || loading

    const replyData =
        deletePostMutationData?.data?.deleteForumReply ?? data?.forumReplies

    console.log({ replyData, deletePostMutationData, data })

    const replies = replyData?.replies
    const selectedPage = replyData?.selectedPage
    const pages = replyData?.pages
    if (!replies) {
        return <IntegratedLoader />
    }

    async function handlePageChange({ selected }) {
        await refetch({
            input: {
                threadId: threadId,
                page: selected + 1,
            },
        })

        await setDeletePostMutationData(undefined)
        console.log({ selected })
    }

    async function handleReply(values, actions) {
        sendFormMeta('forum-reply')

        const content = values?.content
        if (!content || content.length === 0) {
            actions.setErrors({
                content: `Please enter a valid message in your reply.`,
            })
            return
        }
        if (content.length > 4000) {
            actions.setErrors({
                content: `You currently have ${content.length} characters which exceeds the maximum of 4,000.`,
            })
            return
        }

        let result
        try {
            result = await mutateReply({
                variables: {
                    input: {
                        threadId: threadId,
                        content,
                    },
                },
            })

            updateQuery((existingCache) => {
                return {
                    forumReplies: result.data.createForumReply,
                }
            })

            actions.resetForm()
        } catch (e) {
            const errorMessage = e?.graphQLErrors?.[0]?.message

            actions.setErrors({
                content: errorMessage,
            })
        }

        await setDeletePostMutationData(undefined)
    }

    async function handleDelete(reply, setOpenEditModal) {
        const data = await mutateDeleteReply({
            variables: {
                input: {
                    replyId: reply?.id,
                    page: selectedPage,
                },
            },
        })

        setDeletePostMutationData(data)

        setOpenEditModal(false)
    }

    const role = data?.viewer.player.role

    const isStaff = role && role !== 'PLAYER'

    return (
        <div
            className={`thread-replies ${
                isRefetching ? 'thread-replies__loading' : ''
            }`}
        >
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
                containerClassName={'forum-pagination'}
                subContainerClassName={'pages pagination'}
                activeClassName={'active'}
            />
            <div className="thread-replies__replies">
                {replies.length === 0 && (
                    <li className="thread-reply">
                        <div className="message">No replies yet!</div>
                    </li>
                )}
                {replies?.map((reply) => (
                    <ForumThreadReply
                        key={reply.id}
                        reply={reply}
                        threadId={threadId}
                        page={selectedPage}
                        handleDelete={handleDelete}
                    />
                ))}
            </div>
            <div className="thread-replies__reply">
                <Formik
                    initialValues={{
                        content: '',
                    }}
                    onSubmit={handleReply}
                >
                    {(props) => (
                        <Form name="forum-reply">
                            <Field
                                name="content"
                                placeholder={`${
                                    isLocked
                                        ? 'Locked thread'
                                        : 'Type a message'
                                }`}
                                component={Textarea}
                                disabled={!isStaff ? isLocked : null}
                            />
                            <Field
                                component={Button}
                                styleType="primary"
                                color="blue"
                                name="postMessageButton"
                                disabled={!isStaff ? isLocked : null}
                            >
                                <span>Post message</span>
                                <img src={SendMessage} alt="submit" />
                            </Field>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    )
}

export default ForumThreadReplies
