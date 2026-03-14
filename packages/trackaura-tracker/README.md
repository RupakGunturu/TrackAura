# @trackaura/tracker

Browser tracker for TrackAura analytics.

## Install (local npm link)

```bash
cd packages/trackaura-tracker
npm link
```

Then in your target app:

```bash
npm link @trackaura/tracker
```

## Usage

```js
import { initTrackAuraTracker } from "@trackaura/tracker";

const tracker = initTrackAuraTracker({
  apiBaseUrl: "http://localhost:4000",
  projectId: "your-project-id"
});
```

Optional custom event:

```js
tracker.track("click", { x: 100, y: 200, value: 1 });
```
