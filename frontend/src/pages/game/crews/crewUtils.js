export function crewNameComplement(crewType) {
    let nameComplement = ', Inc.'
    if (crewType === 'Gang') {
        nameComplement = ' Crime Family'
    }
    if (crewType === 'Cartel') {
        nameComplement = ' Cartel'
    }
    return nameComplement
}

export function crewMemberDesignation(crewType) {
    let memberDesignation = 'Employee'
    if (crewType === 'Gang') {
        memberDesignation = 'Gangster'
    }
    if (crewType === 'Cartel') {
        memberDesignation = 'Sicario'
    }
    return memberDesignation
}

export function crewMemberTieredDesignation(crewType, tier) {
    let memberDesignation = 'Leader'

    if (tier === 1) {
        if (crewType === 'Corporation') {
            memberDesignation = 'CEO'
        }
    }

    if (tier === 2) {
        if (crewType === 'Corporation') {
            memberDesignation = 'COO'
        }
        if (crewType === 'Gang') {
            memberDesignation = 'Right Hand Man'
        }
        if (crewType === 'Cartel') {
            memberDesignation = 'Lieutenant'
        }
    }

    if (tier === 3) {
        if (crewType === 'Corporation') {
            memberDesignation = 'Executive'
        }
        if (crewType === 'Gang') {
            memberDesignation = 'Deputy'
        }
        if (crewType === 'Cartel') {
            memberDesignation = 'Director'
        }
    }

    if (tier === 4) {
        memberDesignation = crewMemberDesignation(crewType)
    }
    return memberDesignation
}
