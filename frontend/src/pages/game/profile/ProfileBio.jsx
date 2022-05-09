import React, { useState } from 'react'
import Button from '../../_common/Button'

function addNewLines(bio) {
    return bio.replace(/(\r\n|\r|\n)/gm, '<br>')
}

function createMarkup(bio) {
    return {
        __html: addNewLines(bio),
    }
}

function ProfileBio({ player, canEditProfile, setToggleEditBio }) {
    function handleClick(event) {
        setToggleEditBio(true)
    }

    if (!player?.bio) {
        return (
            <>
                <div className="profile__bio profile__bio--unset">
                    {canEditProfile ? "You haven't" : `${player?.name} hasn't`}
                    {' set a bio.'}
                </div>
                {canEditProfile && (
                    <form onSubmit={handleClick}>
                        <Button
                            color="blue"
                            styleType="primary"
                            className="profile-bio-button"
                            onClicK={() => setToggleEditBio(true)}
                        >
                            Write bio
                        </Button>
                    </form>
                )}
            </>
        )
    }

    return (
        <>
            <div
                className="profile__bio"
                dangerouslySetInnerHTML={createMarkup(player?.bio)}
            />
            {canEditProfile && (
                <form onSubmit={handleClick}>
                    <Button
                        color="blue"
                        styleType="secondary"
                        className="profile-bio-button"
                        onClicK={() => setToggleEditBio(true)}
                    >
                        Edit bio
                    </Button>
                </form>
            )}
        </>
    )
}

export default ProfileBio
