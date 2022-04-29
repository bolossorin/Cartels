import chip10 from 'img/roulette/chips/10black.svg'
import chip100 from 'img/roulette/chips/100blue.svg'
import chip1k from 'img/roulette/chips/1kgreen.svg'
import chip5k from 'img/roulette/chips/5korange.svg'
import chip10k from 'img/roulette/chips/10kred.svg'
import chip100k from 'img/roulette/chips/100kblack.svg'
import chip500k from 'img/roulette/chips/500kpurple.svg'
import chip1m from 'img/roulette/chips/1mpink.svg'
import chip10m from 'img/roulette/chips/10mgold.svg'
import chip100m from 'img/roulette/chips/100mteal.svg'

export const ROULETTE_BLACKS = [
    '2',
    '4',
    '6',
    '8',
    '10',
    '11',
    '13',
    '15',
    '17',
    '20',
    '22',
    '24',
    '26',
    '28',
    '29',
    '31',
    '33',
    '35',
]

export const ROULETTE_CHIPS = {
    10: [10, chip10],
    100: [100, chip100],
    '1k': [1000, chip1k],
    '5k': [5000, chip5k],
    '10k': [10000, chip10k],
    '100k': [100000, chip100k],
    '500k': [500000, chip500k],
    '1m': [1000000, chip1m],
    '10m': [10000000, chip10m],
    '100m': [100000000, chip100m],
}

export const ROULETTE_TARGETS = {
    // Name, X Center, Y Center, Width, Height, Hover highlighting override (optional)
    col1: ['1st Column (2:1 Payout)', 112, 44, 226, 32],
    col2: ['2nd Column (2:1 Payout)', 340, 44, 222, 32],
    col3: ['3rd Column (2:1 Payout)', 566, 44, 226, 32],

    even: ['Even (1:1 Payout)', 583, 88, 56, 47],
    odd: ['Odd (1:1 Payout)', 646, 88, 58, 47],

    red: ['Red (1:1 Payout)', 583, 138, 56, 47],
    black: ['Black (1:1 Payout)', 646, 138, 58, 47],

    // Street
    'street3-1': ['Street (11:1 Payout)', 46, 164, 20, 16],
    'street6-4': ['Street (11:1 Payout)', 90, 164, 20, 16],
    'street9-7': ['Street (11:1 Payout)', 134, 164, 20, 16],
    'street12-10': ['Street (11:1 Payout)', 178, 164, 20, 16],
    'street15-13': ['Street (11:1 Payout)', 222, 164, 20, 16],
    'street18-16': ['Street (11:1 Payout)', 266, 164, 20, 16],
    'street21-19': ['Street (11:1 Payout)', 310, 164, 20, 16],
    'street24-22': ['Street (11:1 Payout)', 354, 164, 20, 16],
    'street27-25': ['Street (11:1 Payout)', 398, 164, 20, 16],
    'street30-28': ['Street (11:1 Payout)', 442, 164, 20, 16],
    'street33-31': ['Street (11:1 Payout)', 486, 164, 20, 16],
    'street36-34': ['Street (11:1 Payout)', 530, 164, 20, 16],

    '1-18': ['1-18 (1:1 Payout)', 165, 182, 328, 32],
    '19-36': ['19-36 (1:1 Payout)', 505, 182, 340, 32],

    // Corners
    'corner3-6-2-5': ['Corner (8:1 Payout)', 68, 96, 20, 18],
    'corner2-5-1-4': ['Corner (8:1 Payout)', 68, 130, 20, 18],

    'corner6-9-5-8': ['Corner (8:1 Payout)', 112, 96, 20, 18],
    'corner5-8-4-7': ['Corner (8:1 Payout)', 112, 130, 20, 18],

    'corner9-12-8-11': ['Corner (8:1 Payout)', 156, 96, 20, 18],
    'corner8-11-7-10': ['Corner (8:1 Payout)', 156, 130, 20, 18],

    'corner12-15-11-14': ['Corner (8:1 Payout)', 200, 96, 20, 18],
    'corner11-14-10-13': ['Corner (8:1 Payout)', 200, 130, 20, 18],

    'corner15-18-14-17': ['Corner (8:1 Payout)', 244, 96, 20, 18],
    'corner14-17-13-16': ['Corner (8:1 Payout)', 244, 130, 20, 18],

    'corner18-21-17-20': ['Corner (8:1 Payout)', 288, 96, 20, 18],
    'corner17-20-16-19': ['Corner (8:1 Payout)', 288, 130, 20, 18],

    'corner21-24-20-23': ['Corner (8:1 Payout)', 332, 96, 20, 18],
    'corner20-23-19-22': ['Corner (8:1 Payout)', 332, 130, 20, 18],

    'corner24-27-23-26': ['Corner (8:1 Payout)', 376, 96, 20, 18],
    'corner23-26-22-25': ['Corner (8:1 Payout)', 376, 130, 20, 18],

    'corner27-30-26-29': ['Corner (8:1 Payout)', 420, 96, 20, 18],
    'corner26-29-25-28': ['Corner (8:1 Payout)', 420, 130, 20, 18],

    'corner30-33-29-32': ['Corner (8:1 Payout)', 464, 96, 20, 18],
    'corner29-32-28-31': ['Corner (8:1 Payout)', 464, 130, 20, 18],

    'corner33-36-32-35': ['Corner (8:1 Payout)', 508, 96, 20, 18],
    'corner32-35-31-34': ['Corner (8:1 Payout)', 508, 130, 20, 18],

    // Horizontal splits
    'split3-2': ['Split (17:1 Payout)', 46, 96, 16, 16],
    'split2-1': ['Split (17:1 Payout)', 46, 130, 16, 16],

    'split6-5': ['Split (17:1 Payout)', 90, 96, 16, 16],
    'split5-4': ['Split (17:1 Payout)', 90, 130, 16, 16],

    'split9-8': ['Split (17:1 Payout)', 134, 96, 16, 16],
    'split8-7': ['Split (17:1 Payout)', 134, 130, 16, 16],

    'split12-11': ['Split (17:1 Payout)', 178, 96, 16, 16],
    'split11-10': ['Split (17:1 Payout)', 178, 130, 16, 16],

    'split15-14': ['Split (17:1 Payout)', 222, 96, 16, 16],
    'split14-13': ['Split (17:1 Payout)', 222, 130, 16, 16],

    'split18-17': ['Split (17:1 Payout)', 266, 96, 16, 16],
    'split17-16': ['Split (17:1 Payout)', 266, 130, 16, 16],

    'split21-20': ['Split (17:1 Payout)', 310, 96, 16, 16],
    'split20-19': ['Split (17:1 Payout)', 310, 130, 16, 16],

    'split24-23': ['Split (17:1 Payout)', 354, 96, 16, 16],
    'split23-22': ['Split (17:1 Payout)', 354, 130, 16, 16],

    'split27-26': ['Split (17:1 Payout)', 398, 96, 16, 16],
    'split26-25': ['Split (17:1 Payout)', 398, 130, 16, 16],

    'split30-29': ['Split (17:1 Payout)', 442, 96, 16, 16],
    'split29-28': ['Split (17:1 Payout)', 442, 130, 16, 16],

    'split33-32': ['Split (17:1 Payout)', 486, 96, 16, 16],
    'split32-31': ['Split (17:1 Payout)', 486, 130, 16, 16],

    'split36-35': ['Split (17:1 Payout)', 530, 96, 16, 16],
    'split35-34': ['Split (17:1 Payout)', 530, 130, 16, 16],

    // Vertical splits
    'split0-3': ['Split (17:1 Payout)', 24, 79, 16, 18],
    'split0-2': ['Split (17:1 Payout)', 24, 113, 16, 18],
    'split0-1': ['Split (17:1 Payout)', 24, 148, 16, 18],

    'split3-6': ['Split (17:1 Payout)', 68, 79, 16, 18],
    'split2-5': ['Split (17:1 Payout)', 68, 113, 16, 18],
    'split1-4': ['Split (17:1 Payout)', 68, 148, 16, 18],

    'split6-9': ['Split (17:1 Payout)', 112, 79, 16, 18],
    'split5-8': ['Split (17:1 Payout)', 112, 113, 16, 18],
    'split4-7': ['Split (17:1 Payout)', 112, 148, 16, 18],

    'split9-12': ['Split (17:1 Payout)', 156, 79, 16, 18],
    'split8-11': ['Split (17:1 Payout)', 156, 113, 16, 18],
    'split7-10': ['Split (17:1 Payout)', 156, 148, 16, 18],

    'split12-15': ['Split (17:1 Payout)', 200, 79, 16, 18],
    'split11-14': ['Split (17:1 Payout)', 200, 113, 16, 18],
    'split10-13': ['Split (17:1 Payout)', 200, 148, 16, 18],

    'split15-18': ['Split (17:1 Payout)', 244, 79, 16, 18],
    'split14-17': ['Split (17:1 Payout)', 244, 113, 16, 18],
    'split13-16': ['Split (17:1 Payout)', 244, 148, 16, 18],

    'split18-21': ['Split (17:1 Payout)', 288, 79, 16, 18],
    'split17-20': ['Split (17:1 Payout)', 288, 113, 16, 18],
    'split16-19': ['Split (17:1 Payout)', 288, 148, 16, 18],

    'split21-24': ['Split (17:1 Payout)', 332, 79, 16, 18],
    'split20-23': ['Split (17:1 Payout)', 332, 113, 16, 18],
    'split19-22': ['Split (17:1 Payout)', 332, 148, 16, 18],

    'split24-27': ['Split (17:1 Payout)', 376, 79, 16, 18],
    'split23-26': ['Split (17:1 Payout)', 376, 113, 16, 18],
    'split22-25': ['Split (17:1 Payout)', 376, 148, 16, 18],

    'split27-30': ['Split (17:1 Payout)', 420, 79, 16, 18],
    'split26-29': ['Split (17:1 Payout)', 420, 113, 16, 18],
    'split25-28': ['Split (17:1 Payout)', 420, 148, 16, 18],

    'split30-33': ['Split (17:1 Payout)', 464, 79, 16, 18],
    'split29-32': ['Split (17:1 Payout)', 464, 113, 16, 18],
    'split28-31': ['Split (17:1 Payout)', 464, 148, 16, 18],

    'split33-36': ['Split (17:1 Payout)', 508, 79, 16, 18],
    'split32-35': ['Split (17:1 Payout)', 508, 113, 16, 18],
    'split31-34': ['Split (17:1 Payout)', 508, 148, 16, 18],

    n0: ['Zero (35:1 Payout)', 11, 112, 22, 98],
    n3: ['Straight Up (35:1 Payout)', 46, 79, 20, 20],
    n2: ['Straight Up (35:1 Payout)', 46, 113, 20, 20],
    n1: ['Straight Up (35:1 Payout)', 46, 148, 20, 20],
    n6: ['Straight Up (35:1 Payout)', 90, 79, 20, 20],
    n5: ['Straight Up (35:1 Payout)', 90, 113, 20, 20],
    n4: ['Straight Up (35:1 Payout)', 90, 148, 20, 20],
    n9: ['Straight Up (35:1 Payout)', 134, 79, 20, 20],
    n8: ['Straight Up (35:1 Payout)', 134, 113, 20, 20],
    n7: ['Straight Up (35:1 Payout)', 134, 148, 20, 20],
    n12: ['Straight Up (35:1 Payout)', 178, 79, 20, 20],
    n11: ['Straight Up (35:1 Payout)', 178, 113, 20, 20],
    n10: ['Straight Up (35:1 Payout)', 178, 148, 20, 20],
    n15: ['Straight Up (35:1 Payout)', 222, 79, 20, 20],
    n14: ['Straight Up (35:1 Payout)', 222, 113, 20, 20],
    n13: ['Straight Up (35:1 Payout)', 222, 148, 20, 20],
    n18: ['Straight Up (35:1 Payout)', 266, 79, 20, 20],
    n17: ['Straight Up (35:1 Payout)', 266, 113, 20, 20],
    n16: ['Straight Up (35:1 Payout)', 266, 148, 20, 20],
    n21: ['Straight Up (35:1 Payout)', 310, 79, 20, 20],
    n20: ['Straight Up (35:1 Payout)', 310, 113, 20, 20],
    n19: ['Straight Up (35:1 Payout)', 310, 148, 20, 20],
    n24: ['Straight Up (35:1 Payout)', 354, 79, 20, 20],
    n23: ['Straight Up (35:1 Payout)', 354, 113, 20, 20],
    n22: ['Straight Up (35:1 Payout)', 354, 148, 20, 20],
    n27: ['Straight Up (35:1 Payout)', 398, 79, 20, 20],
    n26: ['Straight Up (35:1 Payout)', 398, 113, 20, 20],
    n25: ['Straight Up (35:1 Payout)', 398, 148, 20, 20],
    n30: ['Straight Up (35:1 Payout)', 442, 79, 20, 20],
    n29: ['Straight Up (35:1 Payout)', 442, 113, 20, 20],
    n28: ['Straight Up (35:1 Payout)', 442, 148, 20, 20],
    n33: ['Straight Up (35:1 Payout)', 486, 79, 20, 20],
    n32: ['Straight Up (35:1 Payout)', 486, 113, 20, 20],
    n31: ['Straight Up (35:1 Payout)', 486, 148, 20, 20],
    n36: ['Straight Up (35:1 Payout)', 530, 79, 20, 20],
    n35: ['Straight Up (35:1 Payout)', 530, 113, 20, 20],
    n34: ['Straight Up (35:1 Payout)', 530, 148, 20, 20],
}
