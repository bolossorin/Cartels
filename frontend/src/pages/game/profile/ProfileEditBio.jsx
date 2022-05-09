import React from 'react'
import { gql } from 'apollo-boost'
import { useMutation } from '@apollo/react-hooks'
import Button from '../../_common/Button'

import './ProfileEditBio.scss'
import { Link } from 'react-router-dom'

const EDIT_BIO_MUTATION = gql`
    mutation editBio($input: EditBioInput!) {
        editBio(input: $input) {
            success
            player {
                id
                bio
            }
        }
    }
`

function ProfileEditBio({ player, setToggleEditBio }) {
    const [mutateEditBio, { data, loading }] = useMutation(EDIT_BIO_MUTATION)

    function handleEdit(event) {
        const bio = event.target.bio.value

        mutateEditBio({
            variables: {
                input: {
                    bio,
                },
            },
        })

        setToggleEditBio(false)

        event.preventDefault()
    }

    const hasEditedProfile = data?.editBio?.success

    const buttonStyle = hasEditedProfile ? 'green' : 'primary'
    let buttonText = hasEditedProfile ? 'Success!' : 'Edit Profile'
    if (loading) {
        buttonText = 'Loading...'
    }

    return (
        <form onSubmit={handleEdit}>
            <div className="profile__bio profile__bio--edit">
                <textarea
                    name="bio"
                    defaultValue={player.bio}
                    autoFocus
                    placeholder="Your bio here"
                />
            </div>
            <Button
                className="profile-bio-button"
                color="blue"
                disabled={loading ? true : undefined}
            >
                {buttonText}
            </Button>
        </form>
    )
}

export default ProfileEditBio
