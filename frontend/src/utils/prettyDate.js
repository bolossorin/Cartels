import { formatDistance } from 'date-fns'

export function prettyDate(date) {
    const time = new Date()
    time.setTime(date)

    return formatDistance(time, new Date(), { addSuffix: true })
}
