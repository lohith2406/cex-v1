import type { Balance } from "../types/balance"
import type { Orderbook } from "../types/orderbook"

export const BALANCES: Record<number, Record<number, Balance>> = {
    /*
   userId: {
       assetId: {
           available: number,
           locked: number
       },

       assetId: {
           available: number,
           locked: number
       }
   }
   */
}

export const ORDERBOOKS: Record<number, Orderbook> = {
    1: {
        bids: {},
        asks: {},
        lastTradedPrice: 0n
    },

    2: {
        bids: {},
        asks: {},
        lastTradedPrice: 0n
    }
};