# signallab-d2-render-probe

Throwaway connectivity probe for SignalLab work order SL-1031-01 (D2).
A zero-dependency Node service for the Render free tier (Frankfurt)
that reports status / latency / body head for the Binance fapi public
endpoints SignalLab needs, plus the service egress IP.

- `GET /` health
- `GET /probe` one full measurement round as JSON

No secrets, no production use. Delete after the study closes.
