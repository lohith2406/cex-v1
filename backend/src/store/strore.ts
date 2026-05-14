import type { User } from "../types/User";
import type { Order } from "../types/order";
import type { UserBalance } from "../types/balance";
import type { OrderBookSide } from "../types/orderbook";
import type { Fill } from "../types/fills";
import type { StockSymbol } from "../types/stock";


// --- In-memory state ---
export const USERS: User[] = [];
export const STOCKS = [
  { id: 1, title: "AXIS BANK", symbol: "AXIS" },
  { id: 2, title: "HDFC BANK", symbol: "HDFC" },
  { id: 3, title: "TATA Steel", symbol: "TATA" },
] as const;
export const ORDERS: Order[] = [];
export const FILLS: Fill[] = [];
export const BALANCES: Record<number, UserBalance> = {}; // { userId: { INR: {available, locked}, AXIS: {available, locked}, ... } }
export const ORDERBOOK: Record<StockSymbol, OrderBookSide> = {
  AXIS: { bids: {}, asks: {} },
  HDFC: { bids: {}, asks: {} },
  TATA: { bids: {}, asks: {} },
};