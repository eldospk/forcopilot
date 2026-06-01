# Spending Manager v2.3.2

## Dashboard Enhancement
- Progress bars now show **stacked segments**: red (spent) + purple (planned)
- Bar width is based on combined (expenses + plan costs)
- Budget % shows single **"X% used"** label
- **Mouse over** the bar/amount/% to see tooltip: "Spent: X | Planned: Y | Budget: Z"
- Only active plans (planned/in-progress) for current month are included

## Setup
```bash
cd backend && npm install && npm run seed && npm run dev
cd frontend && npm install && npm run dev
```
