export type Rating = '+' | '0' | '-' | false; // 0 is no longer supported in the GUI, remove later once production has been updated

export type RatingInfo = {
    user: Rating,
    all: RatingStatisticsSingle,
    totalcounts: RatingTotalCounts,
}

export type RatingsForUser = {
    [filename: string]: Rating;
}

export type RatingsForAllUsers = {
    [email: string]: RatingsForUser,
}

export type RatingStatisticsSingle = {
    positive: number,
    negative: number,
    included: boolean,
}

export type RatingTotalCounts = {
    included: number,
    excluded: number,
}

export type RatingStatisticsMultiple = {
    [filename: string]: RatingStatisticsSingle
}

export type ScriptResponse = {
    script: string
}