# Shared API Contract Smoke Checklist

Use this after Phase 1 changes. Run against a local dev server while signed in as a trip owner.

## Shared rules

- Auth is cookie-based; keep the same browser/cookie jar for every request.
- Apply `sql/supabase_expense_transaction_functions.sql` before testing expense delete.
- Activity `PUT` must include `trip_id`.
- Activity and expense `DELETE` must include a JSON body: `{ "id": "...", "trip_id": "..." }`.
- Every response must be JSON with either the expected data or a clear `error`.

## Trip

- [ ] `POST /api/trips` with `{ title, start_date, end_date }` returns `201` and `{ trip }`.
- [ ] `GET /api/trips/:tripId` returns `200` with `trip`, `members`, `activities`, and `expenses`.
- [ ] `PUT /api/trips/:tripId` returns `200` and the updated `trip`.
- [ ] `DELETE /api/trips/:tripId` returns `200` and the trip disappears from `/dashboard`.

## Activities

- [ ] `POST /api/activities` with `{ trip_id, title, activity_date }` returns `201` and `{ activity }`.
- [ ] The new activity appears in `GET /api/trips/:tripId` under `activities`.
- [ ] `PUT /api/activities` with `{ id, trip_id, title }` returns `200` and persists the title.
- [ ] `PUT /api/activities` with `{ id, trip_id, notes }` persists completion checkbox changes.
- [ ] Reorder sends one `PUT` per activity with `{ id, trip_id, order_index }`; all return `200`.
- [ ] `DELETE /api/activities?id=:id` with body `{ id, trip_id }` returns `200` and removes the activity.
- [ ] `DELETE` without `trip_id` returns `400`.

## Expenses

- [ ] `POST /api/expenses` with a valid split returns `201` and `{ expense }`.
- [ ] The new expense appears in `GET /api/trips/:tripId` under `expenses` with `paidByUser` and `expense_shares`.
- [ ] `PUT /api/expenses` with `{ id, trip_id, ... }` returns `200` and persists changes.
- [ ] `DELETE /api/expenses?id=:id` with body `{ id, trip_id }` returns `200` and removes the expense and its shares.
- [ ] `DELETE` with an expense ID from another trip returns `403`/`404` and removes nothing.

## Curl templates

```bash
curl -b cookies.txt -H 'Content-Type: application/json' \
  http://localhost:3000/api/trips/TRIP_ID

curl -b cookies.txt -X PUT -H 'Content-Type: application/json' \
  -d '{"id":"ACTIVITY_ID","trip_id":"TRIP_ID","title":"Updated"}' \
  http://localhost:3000/api/activities

curl -b cookies.txt -X DELETE -H 'Content-Type: application/json' \
  -d '{"id":"ACTIVITY_ID","trip_id":"TRIP_ID"}' \
  'http://localhost:3000/api/activities?id=ACTIVITY_ID'

curl -b cookies.txt -X DELETE -H 'Content-Type: application/json' \
  -d '{"id":"EXPENSE_ID","trip_id":"TRIP_ID"}' \
  'http://localhost:3000/api/expenses?id=EXPENSE_ID'
```

## Done when

- Every checked request returns the expected status.
- Reloading `/trips/:tripId` shows the same data that the API returned.
- No create/update/delete flow depends on a mismatched query/body contract.
