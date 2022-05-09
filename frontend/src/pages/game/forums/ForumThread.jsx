import React, { useEffect, useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import Content from '../../_common/Content/Content'
import Back from 'img/icons/back.svg'
import NoPosterAvatar from 'img/default-avatar.png'
import NameTag from '../_common/NameTag'
import ForumsSpecials from './ForumSpecials'
import { useParams } from 'react-router'
import { gql } from 'apollo-boost'
import { useMutation, useQuery } from '@apollo/react-hooks'

import ForumThreadReplies from './ForumThreadReplies'

import './Forums.scss'
import IntegratedLoader from '../_common/Loading/IntegratedLoader'
import { prettyDate } from '../../../utils/prettyDate'
import Button from '../../_common/Button'
import Masthead from '../../_common/Masthead/Masthead'
import OptionsCog from 'img/forums/cog.svg'
import EditPencil from 'img/forums/edit.svg'
import Modal from '../_common/Modal'
import SlideCheck from '../../_common/SlideCheck'
import Locked from 'img/forums/locked.svg'
import { Field, Form, Formik } from 'formik'
import Textarea from '../../_common/Textarea'
import SendMessage from 'img/forums/send-message.svg'
import Input from '../../_common/Input'
import useClickStreamFormMeta from '../../../hooks/useClickStreamFormMeta'
import { MY_CREW_QUERY } from '../crews/MyCrew/MyCrew'

const THREAD = gql`
    query forumThread($input: ForumThreadInput!) {
        viewer {
            player {
                id
                role
            }
        }
        forumThread(input: $input) {
            id
            name
            content
            isLocked
            isAnnouncement
            isPinned
            isHidden
            player {
                id
                name
                id
                role
            }
            dateCreated
            dateUpdated
            dateEdited
            dateReplied
            permissions {
                canDelete
                canHide
                canLock
                canEdit
                canPin
                canMakeAnnouncement
            }
        }
    }
`

const EDIT_THREAD = gql`
    mutation EditThread($input: EditForumThreadInput!) {
        editForumThread(input: $input) {
            id
            name
            content
            dateEdited
        }
    }
`

const DELETE_THREAD = gql`
    mutation deleteForumThread($input: DeleteForumThreadInput!) {
        deleteForumThread(input: $input) {
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

const SWITCH_LOCK = gql`
    mutation lockForumThread($input: LockForumThreadInput!) {
        lockForumThread(input: $input) {
            id
            isLocked
        }
    }
`

const SWITCH_STICKY = gql`
    mutation stickyForumThread($input: StickyForumThreadInput!) {
        stickyForumThread(input: $input) {
            id
            isPinned
        }
    }
`

const SWITCH_ANNOUNCEMENT = gql`
    mutation announcementForumThread($input: AnnouncementForumThreadInput!) {
        announcementForumThread(input: $input) {
            id
            isAnnouncement
        }
    }
`

const SWITCH_HIDE = gql`
    mutation hideForumThread($input: HideForumThreadInput!) {
        hideForumThread(input: $input) {
            id
            isHidden
        }
    }
`

function ForumThread() {
    const { category, threadId } = useParams()
    const [openEditModal, setOpenEditModal] = useState(false)
    const [isDeletingPost, setIsDeletingPost] = useState(false)
    const [isEditingPost, setIsEditingPost] = useState(false)
    const [lockSwitch, setLockSwitch] = useState(false)
    const [stickySwitch, setStickySwitch] = useState(false)
    const [announcementSwitch, setAnnouncementSwitch] = useState(false)
    const [hideSwitch, setHideSwitch] = useState(false)
    const [mutateThread] = useMutation(EDIT_THREAD)
    const [mutateLockSwitch] = useMutation(SWITCH_LOCK)
    const [mutateStickySwitch] = useMutation(SWITCH_STICKY)
    const [mutateAnnouncementSwitch] = useMutation(SWITCH_ANNOUNCEMENT)
    const [mutateHideSwitch] = useMutation(SWITCH_HIDE)
    const [mutateDelete] = useMutation(DELETE_THREAD)
    const sendFormMeta = useClickStreamFormMeta()
    const history = useHistory()

    const { data } = useQuery(THREAD, {
        variables: {
            input: {
                threadId: threadId,
            },
        },
    })

    const thread = data?.forumThread
    const playerRole = data?.viewer?.player?.role
    const viewerIsNotStaff = !['MODERATOR', 'ADMINISTRATOR'].includes(
        playerRole
    )
    const isPinned = data?.forumThread?.isPinned
    const isLocked = data?.forumThread?.isLocked
    const isAnnouncement = data?.forumThread?.isAnnouncement
    const isHidden = data?.forumThread?.isHidden
    const canDelete = data?.forumThread?.permissions?.canDelete
    const canHide = data?.forumThread?.permissions?.canHide
    const canEdit = data?.forumThread?.permissions?.canEdit
    const canLock = data?.forumThread?.permissions?.canLock
    const canPin = data?.forumThread?.permissions?.canPin

    useEffect(() => {
        setLockSwitch(isLocked)
        setStickySwitch(isPinned)
        setAnnouncementSwitch(isAnnouncement)
        setHideSwitch(isHidden)
    }, [thread])

    const canMakeAnnouncement =
        data?.forumThread?.permissions?.canMakeAnnouncement
    const displayOptions =
        canDelete || canHide || canMakeAnnouncement || canLock || canPin

    if (!thread) {
        return <IntegratedLoader />
    }

    async function handleLockSwitch() {
        await mutateLockSwitch({
            variables: {
                input: {
                    threadId: thread?.id,
                    lockSwitch: !lockSwitch,
                },
            },
        })
    }

    async function handleAnnouncementSwitch() {
        await mutateAnnouncementSwitch({
            variables: {
                input: {
                    threadId: thread?.id,
                    announcementSwitch: !announcementSwitch,
                },
            },
        })
    }

    async function handleStickySwitch() {
        await mutateStickySwitch({
            variables: {
                input: {
                    threadId: thread?.id,
                    stickySwitch: !stickySwitch,
                },
            },
        })
    }

    async function handleHideSwitch() {
        await mutateHideSwitch({
            variables: {
                input: {
                    threadId: thread?.id,
                    hideSwitch: !hideSwitch,
                },
            },
        })
    }

    async function handleDelete() {
        const data = await mutateDelete({
            variables: {
                input: {
                    threadId: thread?.id,
                },
            },
        })

        history.push(`/forums/${category}`)

        setOpenEditModal(false)
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
                        threadId: thread.id,
                        title,
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
        <>
            <Content
                color="game"
                className={`forums forum-thread ${
                    thread?.isLocked ? 'forum-thread--locked' : ''
                }`}
            >
                <Masthead fullWidth>
                    <Link to={`../${category}`}>
                        <img src={Back} alt="back to category" />
                    </Link>{' '}
                    {thread.name}
                </Masthead>
                <Modal
                    isOpen={openEditModal}
                    className="forum-post-settings-modal"
                    noFullScreen
                >
                    {!isDeletingPost && (
                        <>
                            {canPin && (
                                <SlideCheck
                                    className={`crew-settings__applications-switch`}
                                    label="Sticky post"
                                    checked={isPinned}
                                    onChange={(e) => {
                                        handleStickySwitch()
                                        e.stopPropagation()
                                    }}
                                    name={'stickySwitch'}
                                />
                            )}
                            {canLock && (
                                <SlideCheck
                                    className={`crew-settings__applications-switch`}
                                    label="Lock post"
                                    checked={isLocked}
                                    onChange={(e) => {
                                        handleLockSwitch()
                                        e.stopPropagation()
                                    }}
                                    name={'lockSwitch'}
                                />
                            )}
                            {canMakeAnnouncement && (
                                <SlideCheck
                                    className={`crew-settings__applications-switch`}
                                    label="Announcement"
                                    checked={isAnnouncement}
                                    onChange={(e) => {
                                        handleAnnouncementSwitch()
                                        e.stopPropagation()
                                    }}
                                    name={'announcementSwitch'}
                                />
                            )}
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
                                    onClick={handleDelete}
                                >
                                    Confirm delete
                                </Button>
                            </div>
                        </>
                    )}
                </Modal>
                <div className="original-post">
                    <div className="original-post__top">
                        <div className="poster">
                            <img
                                alt={thread?.player?.name}
                                className="avatar"
                                src={NoPosterAvatar}
                            />
                            <NameTag player={thread?.player} />
                        </div>
                        <div className="original-post__actions">
                            {displayOptions && (
                                <Button
                                    className="message__actions__settings"
                                    styleType="quaternary"
                                    color="white"
                                    onClick={() => setOpenEditModal(true)}
                                >
                                    <img src={OptionsCog} alt="edit message" />
                                </Button>
                            )}
                            {canEdit && (
                                <Button
                                    className="message__actions__edit"
                                    styleType="quaternary"
                                    color="white"
                                    onClick={() =>
                                        setIsEditingPost(!isEditingPost)
                                    }
                                >
                                    <img src={EditPencil} alt="edit message" />
                                </Button>
                            )}
                        </div>
                    </div>
                    <div className="original-post__content">
                        {!isEditingPost && thread.content}
                        {isEditingPost && (
                            <Formik
                                initialValues={{
                                    content: `${thread.content}`,
                                    title: `${thread.name}`,
                                }}
                                onSubmit={handleEdit}
                            >
                                {(props) => (
                                    <Form
                                        name="forum-edit"
                                        className="forum-edit"
                                    >
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
                                            name="editMessageButton"
                                        >
                                            <span>Edit post</span>
                                        </Field>
                                    </Form>
                                )}
                            </Formik>
                        )}
                    </div>
                    <div className="original-post__bottom">
                        <p className="time">
                            {`Created ${prettyDate(thread?.dateCreated)}${
                                !!thread?.dateEdited
                                    ? `, last edited ${prettyDate(
                                          thread?.dateEdited
                                      )}`
                                    : ''
                            }${
                                thread?.dateCreated !== thread?.dateUpdated
                                    ? ` (last updated ${prettyDate(
                                          thread?.dateUpdated
                                      )})`
                                    : ''
                            }`}
                        </p>
                        <ForumsSpecials thread={thread} />
                    </div>
                </div>
                <ForumThreadReplies
                    threadId={thread.id}
                    isLocked={thread.isLocked}
                />
            </Content>
        </>
    )
}

export default ForumThread
