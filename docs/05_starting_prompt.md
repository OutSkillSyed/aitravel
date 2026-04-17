# STARTING PROMPT FOR ANTIGRAVITY

You have four reference documents in context:
1. Tech Stack + Database
2. Design System
3. API Connections + Contracts
4. Master To-Do List

Act as the principal engineer for a production-grade, SEO-first travel super app.
The product is a Next.js 15 App Router application using TypeScript, Tailwind,
shadcn/ui, Gemini 3.1 Pro, mock repositories first, and Supabase later.

Do not start coding immediately.
First, perform an architecture audit and produce:
1. Final folder and file structure
2. Module boundaries and interface contracts
3. Full route map for all screens
4. Domain model inventory
5. Service inventory with responsibilities
6. Repository inventory with mock implementation plan
7. Ordered implementation plan mapped to the Master To-Do List
8. Risk list and mitigation plan

The application must include:
- Budget-first trip planner
- Three ranked options: Best, Cheapest, Comfort
- Flights, trains, buses, and hotels through adapter interfaces
- Hotel detail page with nearby places using Google Places contract
- Surprise Me deals and alert logic
- Booking orchestrator with explicit state machine
- SEO-ready pages with metadata and structured data

Non-negotiable constraints:
- Follow the four documents exactly
- Use Next.js, not React Native
- Use mocks first, no live Supabase connection yet
- Generate DB schema files, migrations, TypeScript types, and repository interfaces now
- Keep supplier-specific logic out of UI components
- Keep all modules independently testable
- Use strict TypeScript
- Build for speed, SEO, and future Supabase swap-in

End with exactly this line:
I am ready to implement. Awaiting approval to proceed to Phase 1.
