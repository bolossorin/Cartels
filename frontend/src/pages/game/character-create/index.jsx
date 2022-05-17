import React from 'react'
import Modal from '../_common/Modal'
import gql from 'graphql-tag'
import { useMutation } from '@apollo/react-hooks'
import { Formik } from 'formik'

import TextInput from '../_common/Form/TextInput'
import Button from '../_common/Form/Button'

import './CharacterCreate.scss'
import GraphErrors from '../_common/GraphErrors'

const CREATE_INITIAL_PLAYER = gql`
    mutation createInitialPlayer($name: String!, $character: PlayerCharacter!) {
        createInitialPlayer(name: $name, character: $character) {
            id
            name
            character
            rank
            role
            stats {
                bustSuccess
                bustFail
                bustTotal
                bustStreak
                bustStreakMax
                bustedSuccess
                bustedFail
                escapeSuccess
                escapeFail
                escapeStreak
                escapeStreakMax
                crimeSuccess
                crimeEvaded
                crimeJailed
                crimeLootCash
                forumReplies
                forumPosts
                carTheftSuccess
                carTheftFlawlessSuccess
                carTheftFail
                carTheftJailed
            }
        }
    }
`

function CharacterCreate({ onCreateInitialCharacter, isOpen }) {
    const [createPlayer, { loading, error }] = useMutation(
        CREATE_INITIAL_PLAYER
    )

    return (
        <Modal title="Choose your class and name" isOpen={isOpen}>
            <div>
                <div className="character-form">
                    <Formik
                        initialValues={{ displayName: '' }}
                        onSubmit={(values, actions) => {
                            createPlayer({
                                variables: {
                                    name: values.displayName,
                                    character: 'GANGSTER',
                                },
                            })
                                .then((_) => {
                                    onCreateInitialCharacter()
                                })
                                .catch((_) => {
                                    console.log('cic error')
                                })
                        }}
                    >
                        {(props) => (
                            <form
                                onSubmit={props.handleSubmit}
                                className={`${
                                    props.isSubmitting
                                        ? 'form__loading'
                                        : 'form'
                                }`}
                            >
                                <TextInput
                                    name="displayName"
                                    placeholder="Enter a character name"
                                    size={TextInput.Sizes.FullWidth}
                                    maxLength="13"
                                />
                                {error && <GraphErrors error={error} />}
                                <p>A-Z 0-9 AND DASHES ALLOWED (3-13 CHARS)</p>
                                <Button
                                    size={Button.Sizes.LargeCTA}
                                    disabled={loading ? 'disabled' : undefined}
                                >
                                    CREATE YOUR CHARACTER
                                </Button>
                            </form>
                        )}
                    </Formik>
                </div>
            </div>
        </Modal>
    )
}

export default CharacterCreate
