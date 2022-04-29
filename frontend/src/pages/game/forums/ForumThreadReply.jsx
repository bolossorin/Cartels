import React, { useEffect, useState } from 'react'
import { formatDistance } from 'date-fns'
import NoPosterAvatar from 'img/default-avatar.png'
import EditPencil from 'img/forums/edit.svg'
import OptionsCog from 'img/forums/cog.svg'

import NameTag from '../_common/NameTag'
import { prettyDate } from '../../../utils/prettyDate'
import Button from '../../_common/Button'
import SlideCheck from '../../_common/SlideCheck'
import Modal from '../_common/Modal'
import { Field, Form, Formik } from 'formik'
import Textarea from '../../_common/Textarea'
import SendMessage from 'img/forums/send-message.svg'
import ForumsSpecials from './ForumSpecials'
import useClickStreamFormMeta from '../../../hooks/useClickStreamFormMeta'
import { gql } from 'apollo-boost'
import { useMutation } from '@apollo/react-hooks'
import { MY_CREW_QUERY } from '../crews/MyCrew/MyCrew'
import { REPLIES } from './ForumThreadReplies'

const EDIT_REPLY = gql`
    mutation EditReplyFromThread($input: EditForumReplyInput!) {
        editForumReply(input: $input) {
            id
            content
            dateUpdated
        }
    }
`

const SWITCH_HIDE = gql`
    mutation hideForumReply($input: HideForumReplyInput!) {
        hideForumReply(input: $input) {
            id
            isHidden
        }
    }
`

function ForumThreadReply({ reply, threadId, page, handleDelete }) {
    const [openEditModal, setOpenEditModal] = useState(false)
    const [isDeletingPost, setIsDeletingPost] = useState(false)
    const [isEditingPost, setIsEditingPost] = useState(false)
    const [hideSwitch, setHideSwitch] = useState(false)
    const canDelete = reply.permissions.canDelete
    const canHide = reply.permissions.canHide
    const canEdit = reply.permissions.canEdit
    const isHidden = reply.isHidden
    const displayOptions = canDelete || canHide
    const sendFormMeta = useClickStreamFormMeta()
    const [mutateEditReply] = useMutation(EDIT_REPLY, {
        refetchQueries: [
            {
                query: REPLIES,
                variables: {
                    input: {
                        threadId: threadId,
                        page: page,
                    },
                },
            },
        ],
    })
    const [mutateHideSwitch] = useMutation(SWITCH_HIDE)

    useEffect(() => {
        setHideSwitch(isHidden)
    }, [reply])

    async function handleHideSwitch() {
        await mutateHideSwitch({
            variables: {
                input: {
                    replyId: reply?.id,
                    hideSwitch: !hideSwitch,
                },
            },
        })
    }

    async function handleEdit(values, actions) {
        sendFormMeta('forum-edit')

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

        let result
        try {
            result = await mutateEditReply({
                variables: {
                    input: {
                        replyId: reply.id,
                        threadId: threadId,
                        page,
                        content,
                    },
                },
            })

            actions.resetForm()
        } catch (e) {
            const errorMessage = e?.graphQLErrors?.[0]?.message

            actions.setErrors({
                title: errorMessage,
            })
        }
        setIsEditingPost(false)
    }

    return (
        <li className="thread-reply">
            <Modal
                isOpen={openEditModal}
                className="forum-post-settings-modal"
                noFullScreen
            >
                {!isDeletingPost && (
                    <>
                        {canHide && (
                            <SlideCheck
                                className={`crew-settings__applications-switch`}
                                label="Hide post"
                                checked={isHidden}
                                onChange={(e) => {
                                    handleHideSwitch()
                                    e.stopPropagation()
                                }}
                                name={'hideSwitch'}
                            />
                        )}
                        <div className="forum-post-settings-modal__buttons">
                            <Button
                                color="red"
                                styleType="secondary"
                                onClick={() => setIsDeletingPost(true)}
                            >
                                Delete post
                            </Button>
                            <Button
                                color="blue"
                                styleType="primary"
                                onClick={() => setOpenEditModal(false)}
                            >
                                Close
                            </Button>
                        </div>
                    </>
                )}
                {isDeletingPost && (
                    <>
                        <p>{`Are you sure you want to delete this post?`}</p>
                        <div className="forum-post-settings-modal__buttons">
                            <Button
                                color="black"
                                styleType="secondary"
                                onClick={() => setIsDeletingPost(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                color="red"
                                styleType="primary"
                                onClick={() =>
                                    handleDelete(reply, setOpenEditModal)
                                }
                            >
                                Confirm delete
                            </Button>
                        </div>
                    </>
                )}
            </Modal>
            <div className="message">
                <div className="message__top">
                    <div className="poster">
                        <img
                            className="avatar"
                            src={NoPosterAvatar}
                            alt={reply.player.name}
                        />
                        <NameTag player={reply.player} />
                    </div>
                    <div className="message__actions">
                        {displayOptions && (
                            <>
                                <ForumsSpecials thread={reply} />
                                <Button
                                    className="message__actions__settings"
                                    styleType="quaternary"
                                    color="white"
                                    onClick={() => setOpenEditModal(true)}
                                >
                                    <img src={OptionsCog} alt="edit message" />
                                </Button>
                            </>
                        )}
                        {reply.permissions.canEdit && (
                            <Button
                                className="message__actions__edit"
                                styleType="quaternary"
                                color="white"
                                onClick={() => setIsEditingPost(!isEditingPost)}
                            >
                                <img src={EditPencil} alt="edit message" />
                            </Button>
                        )}
                    </div>
                </div>
                <div className="message__content">
                    {!isEditingPost && reply.content}
                    {isEditingPost && (
                        <Formik
                            initialValues={{
                                content: `${reply.content}`,
                            }}
                            onSubmit={handleEdit}
                        >
                            {(props) => (
                                <Form name="forum-edit" className="forum-edit">
                                    <Field
                                        name="content"
                                        placeholder="Type a message"
                                        component={Textarea}
                                    />
                                    <Field
                                        component={Button}
                                        styleType="primary"
                                        color="blue"
                                        name="editMessageButton"
                                    >
                                        <span>Edit post</span>
                                    </Field>
                                </Form>
                            )}
                        </Formik>
                    )}
                </div>
                <p className="message__time">
                    {`${prettyDate(reply.dateCreated)}${
                        reply.dateEdited
                            ? `, last edited ${prettyDate(reply.dateEdited)}`
                            : ''
                    }`}
                </p>
            </div>
        </li>
    )
}

export default ForumThreadReply
