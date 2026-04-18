# The Great Gatsby Gala - BUSA Dinner & Awards

## Project Overview
A Gatsby-themed event management and ticketing web application for the "BUSA Dinner & Awards" event. Features ticket purchasing, table management, attendee tracking, and an admin dashboard.

## Tech Stack
- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 8
- **UI**: Chakra UI v3 + Emotion
- **Routing**: React Router Dom v7
- **Backend/DB**: Supabase (PostgreSQL + Edge Functions)
- **Payments**: Squad payment gateway
- **Package Manager**: npm

## Project Structure
- `src/components/` - UI components (admin, booking, hero, ui)
- `src/pages/` - Top-level pages (Home, Admin, ManageTicket)
- `src/config/` - Constants, event details, color themes
- `src/hooks/` - Custom React hooks
- `src/lib/` - Supabase client initialization
- `src/theme/` - Chakra UI theme customizations
- `supabase/functions/` - Edge functions (emails, webhooks)
- `supabase/migrations/` - Database schema SQL files

## Development
- Run: `npm run dev` (starts Vite dev server on port 5000)
- Build: `npm run build`

## Key Features
- Multi-tier ticketing (Regular, VIP, VVIP)
- Table assignment and seating management
- Admin dashboard with QR code scanner
- Ticket transfer functionality
- Waitlist for sold-out events

## Environment Variables Required
- Supabase URL and anon key (for database/auth)
- Squad API keys (for payment processing)
