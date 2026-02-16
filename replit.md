# Elite Auction - Blind Bid Platform

## Overview
A mobile-first blind auction website for high-profile charity events. Users scan a QR code to access the site, browse auction items, and place sealed bids. Only the admin can see bid rankings after the event ends.

## Recent Changes
- 2026-02-10: Login now creates user profiles - new account IDs auto-register with name input
- 2026-02-10: Bids properly tied to logged-in user session (no more hardcoded userId)
- 2026-02-10: Added My Bids page (/my-bids) with summary of user's bids
- 2026-02-10: Admin dashboard now shows bid time; ranking uses earliest bid as tiebreaker
- 2026-02-10: Added confirmation IDs (BID-XXXXXX) to admin dashboard and CSV exports
- 2026-02-09: Welcome page simplified to single "Enter Auction" button → login page
- 2026-02-09: Login page now routes admin to dashboard, regular users to main page
- 2026-02-09: Added bid validation (bid must be >= starting price) and confirmation popup
- 2026-02-09: Main page changed to 1-column layout with pagination (10 items per page)
- 2026-02-09: Admin dashboard widened for laptop view (max-w-5xl)
- 2026-02-09: Initial MVP build with all core features

## Architecture
- **Frontend**: React + Tailwind CSS + shadcn/ui, mobile-first (max-w-md centered, except admin)
- **Backend**: Express.js + PostgreSQL via Drizzle ORM + express-session
- **Routing**: wouter (client-side)
- **State Management**: TanStack Query v5
- **Theme**: Dark luxury gold theme (Playfair Display font)

## Routes
- `/` - Welcome page (single "Enter Auction" button → /login)
- `/login` - Universal login page (existing users sign in, new users auto-register with name)
- `/main` - Main page with 1-column auction items list + pagination + countdown + My Bids button
- `/my-bids` - User's bid summary page (item names, amounts, times, confirmation IDs)
- `/landing` - Redirects to `/main`
- `/admin-login` - Redirects to `/login`
- `/item/:id` - Item detail page with bid form + validation + confirmation popup
- `/admin` - Admin dashboard (laptop-friendly, full-width)

## API Endpoints
- `POST /api/login` - Login/register with `{ accountId, password, name? }`, returns `{ id, name, role }`
- `GET /api/me` - Get current session (userId, role)
- `POST /api/logout` - Destroy session
- `GET /api/items` - List all auction items
- `GET /api/items/:id` - Get single item details
- `GET /api/event-settings` - Get event countdown end time
- `POST /api/bids` - Place a bid `{ itemId, amount }` (validates bid >= starting price, requires login)
- `GET /api/bids/my` - Get all bids for the logged-in user (with item names)
- `GET /api/bids/my/:itemId` - Check if current user already bid on item
- `GET /api/admin/items` - Get items with bid stats
- `GET /api/admin/items/:id/bids` - Get ranked bids for an item (sorted by amount desc, bid time asc)
- `GET /api/admin/export-csv` - Download all bids as CSV
- `GET /api/admin/items/:id/export-csv` - Download item bids as CSV

## Database Tables
- `users` - accountId (8 digits), password (4 digits), name, role (user/admin)
- `auction_items` - name, description, background, imageUrl, startingPrice, category
- `bids` - confirmationId (BID-XXXXXX), userId, itemId, amount, bidTime (unique per user+item)
- `event_settings` - eventName, endTime

## Key Design Decisions
- Welcome page is the entry point with single "Enter Auction" button
- Login page handles both existing user sign-in and new user registration (name field appears for new accounts)
- Each account ID + password combination maps to a unique user profile
- Bids are tied to the logged-in user's session
- Blind bid: users cannot see others' bids
- One bid per item per user, no edits allowed
- Bid must be >= item's starting price (validated on both client and server)
- Bid confirmation popup shows amount before final submission
- After successful bid, user is redirected to main page after 2 seconds
- Each bid gets a unique confirmation ID (BID-XXXXXX format)
- Main page shows 1-column item list with pagination (10 items per page) and My Bids button
- Admin dashboard shows bid time and uses earliest bid as tiebreaker for same amount
- Admin dashboard is laptop-friendly (max-w-5xl), all other pages mobile-first (max-w-md)
- Event countdown is global (single end time for all items)
- Dark theme by default for luxury feel
- Admin credentials: 00000001/0000
