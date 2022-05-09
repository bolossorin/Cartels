import React from 'react'
import Total from 'img/lab/total-drugs.svg'
import HelpModal from '../_common/HelpModal/HelpModal';

function LabPurityGrade({ lab }) {
    return (
        <div className="item total">
            <h3
                style={{
                    background: `url(${Total}), #282F39`,
                }}
            >
                Purity Grade
            </h3>
            <p className="total-text">
                <span
                    className={`total-text__purity total-text__purity__${
                        lab?.purityGradeClass ?? 'none'
                    }`}
                >
                    {lab?.purityGradePercent ?? '0'}%
                </span>
                {lab?.purityGradeDisplay ?? 'Ungraded'}
                <HelpModal size={18} title="Purity grade">
                    <>Purity grades allow you to see purity.</>
                </HelpModal>
            </p>
        </div>
    )
}

export default LabPurityGrade
