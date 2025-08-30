# Token Claim MVP (React + Vite + Tailwind)

This is the minimal MVP UI we designed together.

## Run locally
```bash
npm i
npm run dev
```
Then open the printed local URL.

## Build
```bash
npm run build
npm run preview
```

> Note: This is a UI-only mock. Wallet/contract wiring (wagmi/RainbowKit + TokenFactory) can be added next.

## Testing

Run basic accessibility linting and responsive tests:

```bash
npm run lint
npm test
```

### Manual test

1. Run `npm run dev` and open the app.
2. Set the browser width to 360 px.
3. Verify that the page does not scroll horizontally (no `overflow-x`).
