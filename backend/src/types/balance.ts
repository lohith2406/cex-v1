export interface AssetBalance {
    available: number,
    locked: number
}

export interface UserBalance {
    [asset: string]: AssetBalance;
}