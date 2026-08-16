# Recommendation Engine — Design Document

## Problem

The default feed (chronological order) is not useful for a logged-in developer.
A React developer sees Django submissions they can't meaningfully review
mixed in with React ones they can. The feed needs to surface what's
actually relevant to each user first.

## Scoring Formula

Every submission is assigned a score when a logged-in user loads the feed.
Submissions are then sorted by score descending.

score = tech_match_points + recency_bonus + review_history_bonus

tech_match_points = (number of submission tags matching user's techStack) × 10
recency_bonus = posted within 7 days → +5
posted within 30 days → +2
older → 0
review_history_bonus = (number of submission tags matching tags
the user has reviewed before) × 3

Logged-out visitors always see chronological order (no score computed).

## Why This Approach

**Tag matching (baseline)** — the most direct signal. If a user listed
React and TypeScript in their stack, React+TypeScript submissions are
more likely to get useful reviews from them.

**Recency weighting (improvement #1)** — without this, older submissions
with many matching tags would permanently outrank new ones. Recency gives
newer submissions a fighting chance to surface before they go stale.

**Review history weighting (improvement #2)** — a user's stated tech stack
and their actual review behaviour can differ. Someone who lists Python but
has only ever reviewed React submissions is more useful to React submitters.
This bonus rewards demonstrated engagement over stated preference.

## Alternatives Considered

**Pure chronological** — the default, kept for logged-out users. Simple
but not personalised at all.

**Weighted average of all ratings** — surfacing highly-rated submissions
first. Rejected because it disadvantages new submissions that haven't
received reviews yet (cold start problem).

**ML-based collaborative filtering** — matching users based on similar
review patterns. Too complex for an MVP and requires significant data
volume to be meaningful.

## Implementation

- `backend/src/routes/submissions.ts` — `GET /api/submissions` route
- `optionalAuth` middleware reads the token if present but doesn't block
  unauthenticated requests
- Scoring runs in Node.js after fetching all submissions — pagination
  is applied after scoring so order is preserved across pages

## How to Demonstrate

1. Create two user accounts with different tech stacks
   (e.g. User A: React, TypeScript / User B: Python, Django)
2. Create submissions tagged with React, TypeScript, Python, Django
3. Log in as User A — React/TypeScript submissions appear first
4. Log in as User B — Python/Django submissions appear first
5. The feed order is visibly and obviously different between the two accounts