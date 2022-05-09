export function collectPerformanceMetadata(formName) {
    const form = document.getElementsByName(formName)?.[0]
    if (!form) {
        return {}
    }

    const meta = { formName }
    for (const element of form) {
        const elementMeta = element.dataset?.performanceMeta
        if (elementMeta) {
            meta[element.name ?? 'unknown'] = JSON.parse(elementMeta) ?? null
        }
    }

    return meta
}
