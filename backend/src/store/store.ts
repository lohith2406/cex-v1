import type { Balance } from "../types/balance"
import type { Orderbook } from "../types/orderbook"

export const BALANCES: Record<number, Record<string, Balance>> = {
    /*
   userId: {
       INR: {
           available: number,
           locked: number
       },

       BTC: {
           available: number,
           locked: number
       }
   }
   */
}

export const ORDERBOOKS: Record<string, Orderbook> = {
   SOL: {
       bids: [],
       asks: [],
       lastTradedPrice: 0n
   },
   BTC: {
       bids: [],
       asks: [],
       lastTradedPrice: 0n
   }
}