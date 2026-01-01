# EarningsEdge RL — Earnings-Aware Exposure Control
🔗 Live App

https://earningsedge.netlify.app/

## Problem

Earnings create predictable timing but unpredictable outcomes. Buy-and-hold ignores this risk; avoiding earnings sacrifices opportunity.

## Why This Problem Matters

Treating earnings as a sequential decision problem allows disciplined exposure control instead of binary gambling.

## Data Used

- Kaggle: U.S. Historical Stock Prices with Earnings Data

- Daily OHLCV data aligned with earnings dates

## Approach

- Custom Gym-style environment

- PPO agent controlling exposure, not direction

- Baselines:

  - Buy & Hold

  - Avoid Earnings

  - Flat Exposure

- Matched-episode evaluation

Metrics are computed offline and surfaced via a React dashboard.

## Evaluation & Findings

- PPO reduces drawdowns vs Buy & Hold

- Performance gains come from selective inaction

- Symbol-level failures are explicitly exposed

## Limitations

- No transaction costs yet

- PPO reward sensitivity

- Equity-only scope

## Planned Next Steps

- Transaction cost & slippage sensitivity tests

- Multi-day holding window evaluation

- Regime-conditioned reporting

## Reproducibility — Run Locally

Dashboard (recommended):
```bash
git clone https://github.com/btheard3/earningsedge
cd earningsedge/ui/earningsedge-dashboard
npm install
npm run dev:ready
```


This:

1. Builds evaluation artifacts

2. Publishes UI data

3. Launches the dashboard

## Portfolio Context

**Event + policy layer** — models disciplined exposure control around earnings events.

## Author

Brandon Theard
Data Scientist | Decision-Support Systems

GitHub: https://github.com/btheard3

LinkedIn: https://www.linkedin.com/in/brandon-theard-811b38131/