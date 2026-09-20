# Zepp OS Smartwatch Application — Subproject Agent Directives

## 1. Target Hardware & Runtime Context
- **Target Device:** Amazfit Balance (Zepp OS 3.0 / API Level 3).
- **Display Specifications:** Round AMOLED, 480 × 480 px, 60 Hz.
- **Center Coordinates:** `(240, 240)` px.
- **Runtime Environment:** MicroJS / QuickJS embedded engine.
- **Platform Constraints:**
  - **No Browser DOM, No HTML, No CSS.**
  - **No standard Node.js global runtime** (no native `fs`, `process`, or native event emitters).
  - Memory-constrained environment: minimize object allocations inside high-frequency loops.
- **Development Tooling:** Zepp CLI (`@zeppos/zeus-cli`), simulator profile `Balance 2` / round 480x480 target.

---

## 2. Architecture: Separation of Concerns
Every functional screen must strictly adhere to the Zepp OS triad pattern:

```text
page/gt/home/
├── index.page.js    # Presentation Controller: Lifecycle, widget creation, event wiring
├── index.class.js   # State & Domain Logic: Pure JavaScript class (unit-testable, NO @zos imports)
└── index.style.js   # Style & Geometry: Plain JS layout objects using px() from @zos/utils
```

### File Responsibilities & Boundaries:
1. **`*.page.js` (Presentation Controller):**
   - Implements page lifecycle methods: `onInit()`, `build()`, and `onDestroy()`.
   - Creates widgets using `hmUI.createWidget()`.
   - Updates widgets dynamically using `widget.setProperty(hmUI.prop.MORE, { ... })`.
   - Binds UI interactions (clicks, gestures) and dispatches actions to `index.class.js`.
   - Manages runtime timers (`@zos/timer`) and guarantees absolute teardown in `onDestroy()`.

2. **`*.class.js` (Pure State & Logic):**
   - Manages the state machine: `IDLE`, `RUNNING`, `PAUSED`, `FINISHED`.
   - Encapsulates domain logic: remaining duration, elapsed percentage, and arc angle math (`-90°` to `270°`).
   - **Strict Requirement:** Must NEVER import `@zos/*` packages. Must execute and pass tests in Node.js test runners without mocks or shims.

3. **`*.style.js` (Layout & Coordinates):**
   - Exports configuration dictionaries consumed directly by `createWidget`.
   - Always computes dimensions and offsets using `px()` from `@zos/utils` or fixed display constants.
   - For full-screen circular widgets (such as `widget.ARC`): container bounds must be defined as `{ x: 0, y: 0, w: 480, h: 480 }` with `{ center_x: 240, center_y: 240 }`.

---

## 3. Platform-Specific Rules & Performance Constraints

### Rule 1: Timer & Animation Engine
- Always use the official `@zos/timer` module (`createTimer` / `stopTimer`). **Never use global `setInterval` or `setTimeout`**.
- Keep animation tick intervals between **30 ms and 33 ms** (~30 FPS) for smooth visual progress without excessive battery drain.
- Maintain active timer handles in the page state and ensure `stopTimer()` is invoked on pause, completion, and `onDestroy()`.

### Rule 2: Widget Rendering & Touch Handling
- Never destroy and recreate widgets in loops to achieve visual animation. Create them once during `build()` and mutate via `setProperty(hmUI.prop.MORE, { ... })`.
- Touch surfaces: Avoid full-screen transparent buttons with `alpha: 0` or empty source assets, as they can cause framebuffer clipping or occlude widgets beneath them. Bind touch listeners directly to visible widgets or clearly defined interactive bounding boxes.

### Rule 3: Storage & Navigation Communication
- One-way parameter passing during page transitions: use `@zos/router` `push({ url, params })`.
- Ephemeral shared state between screens: use `sessionStorage` from `@zos/storage` or `getApp()._options.globalData`.
- Persistent configuration & timer presets: use `LocalStorage` from `@zos/storage` or structured JSON files via `@zos/fs`.

---

## 4. Subproject Agent Roles & Responsibilities

### Role: `Zepp-Core-Engineer`
- **Scope:** `utils/timerEngine.js`, `utils/format.js`, `services/storage.js`, and `page/**/*.class.js`.
- **Primary Tasks:**
  - Implements pure timing calculations, angle mappings, and duration formatting.
  - Implements state machines and storage serialization/deserialization.
- **Strict Boundary:** Zero imports from `@zos/ui` or `@zos/sensor`. All code authored by this role must be fully testable in standard Node.js environments.

### Role: `Zepp-UI-Engineer`
- **Scope:** `page/**/*.page.js`, `page/**/*.style.js`, `services/haptic.js`, and widget layouts.
- **Primary Tasks:**
  - Translates designs into pixel-perfect Zepp OS 3.0 widgets for 480×480 round displays.
  - Wires hardware integrations: `@zos/sensor` (Vibrator) and `@zos/timer`.
  - Coordinates event listeners and lifecycle teardown.
- **Strict Boundary:** Delegates calculations to `class.js` and `utils/`; does not embed raw timing algorithms inside UI callbacks.

### Role: `Zepp-Test-Engineer`
- **Scope:** `tests/**/*.test.js`, mock fixtures, edge-case assertions, and test scripts.
- **Primary Tasks:**
  - Authors unit test coverage for pure modules (`utils/timerEngine.js`, `utils/format.js`, `page/**/*.class.js`).
  - Tests edge cases: 0 ms remaining, rapid start/pause toggling, boundary angle calculations, invalid storage payloads.
  - Prepares structured verification checklists for manual validation in the Zepp OS Simulator.
- **Strict Boundary:** Does not alter widget styling or production layouts; focuses exclusively on test assertions and verification harnesses.

### Role: `Zepp-QA-Auditor`
- **Scope:** Architectural consistency review, memory leak inspection, and build validation.
- **Verification Checklist:**
  1. Are all created hardware timers and event listeners cleared in `onDestroy()`?
  2. Are all widget geometries centered around `(240, 240)` for the circular 480×480 screen?
  3. Are UI strings properly externalized to `page/i18n/*.po` files?
  4. Does `zeus build` compile cleanly without missing target assets or packaging warnings?