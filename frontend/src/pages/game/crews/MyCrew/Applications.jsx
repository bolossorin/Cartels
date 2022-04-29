import React from 'react'
import './../Crews.scss'
import ApplicationItem from './ApplicationItem'

function Applications({ applications, isFull, canManageApplications }) {
    applications?.sort(function (a, b) {
        return new Date(b.dateCreated) - new Date(a.dateCreated)
    })

    return (
        <div className="crew-applications content-padding">
            {applications?.map((application) => (
                <ApplicationItem
                    application={application}
                    canManage={canManageApplications}
                    isFull={isFull}
                />
            ))}
            {applications?.length === 0 && (
                <span className="crew-applications__empty">
                    There are no pending applications at the moment
                </span>
            )}
        </div>
    )
}

export default Applications
