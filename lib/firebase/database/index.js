// Export all database functions
import * as usersDb from "./users"
import * as plotsDb from "./plots"
import * as bookingsDb from "./bookings"
import * as reviewsDb from "./reviews"
import * as notificationsDb from "./notifications"
import * as transactionsDb from "./transactions"

// Group all database services
const dbService = {
  users: usersDb,
  plots: plotsDb,
  bookings: bookingsDb,
  reviews: reviewsDb,
  notifications: notificationsDb,
  transactions: transactionsDb,
}

export default dbService
export { usersDb, plotsDb, bookingsDb, reviewsDb, notificationsDb, transactionsDb }
