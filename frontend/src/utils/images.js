export function getStaticUrl(path, opts) {
    let destPath = `static/${path
        .replace('/static/', '')
        .replace('static/', '')}`

    let queryString = ''
    if (opts) {
        const options = []

        for (const [key, value] of Object.entries(opts)) {
            options.push(`${key}=${value}`)
        }

        if (options.length > 0) {
            queryString = `?${options.join('&')}`
        }
    }
    return `https://static-assets.cartels.com/${destPath}${queryString}`
}
