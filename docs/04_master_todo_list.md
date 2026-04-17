# MASTER TO-DO LIST — ANTIGRAVITY STRICT BUILD ORDER

## Global Rules
- Do not move to the next phase until the current one is verified
- After each phase run Antigravity browser verification
- Do not connect Supabase until the handoff phase
- Build against mocks first

## Phase 0 — Before Build Starts
- [ ] Create Doc 1: Tech Stack + Database
- [ ] Create Doc 2: Design System
- [ ] Create Doc 3: API Connections + Contracts
- [ ] Create Doc 4: Master To-Do List
- [ ] Open Antigravity
- [ ] Select Gemini 3.1 Pro
- [ ] Paste all four documents into context
- [ ] Run the starting build prompt

## Phase 1 — Foundation
- [ ] Approve project charter and file map
- [ ] Build Next.js shell
- [ ] Build component system and design tokens
- [ ] Build domain models and DB contracts
- [ ] Build mock repositories and seed data
- [ ] Verify all major screens render correctly

## Phase 2 — Core Product
- [ ] Build budget planner engine
- [ ] Build planner result cards and itinerary view
- [ ] Build inventory aggregator
- [ ] Build transport search experience
- [ ] Build hotel search and hotel detail
- [ ] Build nearby places module

## Phase 3 — Differentiators
- [ ] Build Surprise Me experience
- [ ] Build deal intelligence logic
- [ ] Build alerts and price history flow
- [ ] Build checkout and booking orchestrator

## Phase 4 — SEO and QA
- [ ] Add Next.js metadata strategy
- [ ] Add structured data for hotel and destination pages
- [ ] Add sitemap.xml and robots.txt
- [ ] Run browser QA for all core journeys
- [ ] Fix every regression before proceeding

## Phase 5 — Supabase Handoff
- [ ] Generate migrations
- [ ] Generate RLS drafts
- [ ] Generate PostGIS enablement script
- [ ] Generate Supabase repository implementations
- [ ] Prepare .env.example
- [ ] Prepare integration handoff checklist

## Drift Correction Prompt
Stop. Re-anchor to the approved architecture in the feed documents.
List all deviations. Refactor to match. Confirm compliance before continuing.
