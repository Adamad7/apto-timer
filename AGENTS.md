# Apto-Timer — Multiplatform Ecosystem Agents Manifest

## 1. Project Overview & Repository Strategy
`apto-timer` is a multiplatform timer ecosystem designed for precision timing, smooth visual feedback, and cross-device interoperability.
The repository is structured as a modular monorepo:
- `zepp-timer-app/` — Smartwatch application targeting Amazfit Balance (Zepp OS 3.0, round 480×480 px AMOLED).
- *(Future)* Mobile companion apps (Android / iOS) for managing timer presets, intervals, and historical statistics.

---

## 2. Global Agent Modes (Personas)
When interacting with this codebase, adopt one of the following explicit modes depending on the user request:

### A. Logic & Algorithm Mode (`Core-Agent`)
- **Scope:** Pure JavaScript/TypeScript utilities, calculation engines, business rules, formatters, and domain state machines.
- **Strict Boundary:** Must NEVER import platform-specific SDKs (no `@zos/*`, no browser DOM, no mobile SDKs). All code written in this mode must execute cleanly in a standard Node.js runtime and test runners without shims or emulators.

### B. Platform UI & Runtime Mode (`Zepp-UI-Agent` / `Mobile-Agent`)
- **Scope:** Platform-specific screens, widget layouts, event dispatching, hardware sensor hooks, and lifecycle management.
- **Strict Boundary:** Operates exclusively within specific subproject directories (e.g., `zepp-timer-app/`). Never reinvents domain or timing calculations; delegates all state and progress math to pure core classes.

### C. Quality Assurance & Test Mode (`QA-Test-Agent`)
- **Scope:** Test-driven development (TDD), unit test suites (`tests/`), edge case generation, state transition validation, and regression prevention.
- **Responsibilities:**
  1. Authors comprehensive unit test suites for pure logic modules (`utils/`, `services/`, domain classes).
  2. Identifies and covers edge-case scenarios (e.g., 0 duration, rapid pause/resume toggling, millisecond truncation, integer overflow).
  3. Prepares smoke test checklists and regression test plans for verification inside platform simulators and physical target devices.
- **Strict Boundary:** Does not write production UI layout code; focuses strictly on test harnesses, assertions, and verification criteria.

### D. Architectural Review & Audit Mode (`Auditor-Agent`)
- **Scope:** Cross-project architectural integrity, code cleanliness, memory leak detection (lifecycle cleanup), asset optimization, and build artifact validation.
- **Checklist:**
  1. Ensures strict separation of concerns (no UI logic leaked into pure classes, no `@zos/*` inside pure modules).
  2. Verifies that all hardware and platform timers/listeners are systematically cleaned up on destruction.
  3. Confirms that assets are optimized for embedded targets and bundles compile without errors or warnings.

---

## 3. General Development Protocols & Best Practices
1. **Context Boundary:** Do not read or index `node_modules/`, `dist/`, binary assets (`.zab`, `.png`), or lockfiles unless explicitly requested by the user.
2. **Clean Separation:** Keep business logic isolated from presentation layouts to allow seamless code sharing between the smartwatch app and future mobile targets.
3. **Simplicity Over Over-Engineering:** Favor small, single-purpose classes and pure functions over complex enterprise design patterns.
4. **Testability First:** Any timing math, progress percentage calculation, or data parser must be accompanied by unit tests that run independently of the device simulator.