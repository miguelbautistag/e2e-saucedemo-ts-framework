# SauceDemo Enterprise E2E Test Automation Platform

A production-ready, type-safe End-to-End automation framework built with **Playwright** and **TypeScript** targeting the SauceDemo storefront application.

---

## 1. System Architecture & Design Philosophy

This platform implements a strict **Layered Quality Engineering Architecture** designed to maximize reliability, maintainability, and horizontal scaling under parallel execution, while completely avoiding common multi-worker race conditions.

### Architectural Layout

* **Decoupled Test Specifications:** Tests remain purely declarative and represent business rules. They contain zero CSS selectors or explicit wait utilities, leaving assertions as their single responsibility.
* **Presentation Layer Separation (POM):** Page Objects act as pure UI structural abstractions. They expose user actions as type-safe async methods and employ lazy-evaluated locator strategies.
* **Deterministic Infrastructure Isolation:** Rather than executing fragile, inline authentication blocks per test runner thread, the framework delegates session state acquisition to an isolated, single-threaded preparation layer.

### Framework Directory Structure

'''automation/e2e-saucedemo-ts/
├── .github/workflows/      # CI/CD Quality Gate Workflow Automation
│   └── playwright.yml
├── auth/                   # Dynamic StorageState Session State Cache Directory (Git Ignored)
├── src/
│   ├── fixtures/
│   │   └── baseFixture.ts  # Type-Safe Dependency Injection & Worker Lifecycle Hook
│   └── pages/              # UI Component & Locational Abstractions
│       ├── CartPage.ts
│       ├── InventoryPage.ts
│       └── LoginPage.ts
├── tests/                  # Declarative Business Behavior Validation Specs
│   ├── auth.setup.ts       # Sequential Authentication Gateway & Session Provisioner
│   ├── auth.spec.ts        # Login Edge Cases & Security Access Controls
│   ├── e2eWorkflows.spec.ts# Core E2E Customer Purchase & Funnel Journeys
│   └── inventory.spec.ts   # Catalogue SLAs & Storage Injection Performance Metrics
├── playwright.config.ts    # Global Core Runtime & Multi-Browser Project Matrix
├── package.json            # Application Manifest & Run Scripts
└── llm-prompts.md          # Human-AI Co-Pilot Engineering Audit Trail'''

---

## 2. Dynamic Session State Caching Matrix (Task A)

To maximize pipeline performance and eliminate redundant API/UI handshakes, this architecture splits test orchestration into an upstream initialization project and a downstream parallel execution engine.

* **The Setup Gate:** tests/auth.setup.ts runs strictly in isolation on its own thread before any core test files trigger. It fills in the credentials for standard_user, waits explicitly for page navigation routing to clear (waitForURL), captures authenticated cookies and localStorage metadata, and serializes them to auth/standard_user.json.
* **Downstream Dependency Injections:** Standard E2E test projects (chromium, firefox) list setup as a strict prerequisite configuration hook. Once the session file settles on disk, the test projects boot up instantly pre-hydrated with cookies, entirely bypassing the authentication UI layer.
* **Thread Safety:** This eliminates multi-worker file write collisions on shared environments (like a 4-to-8 CPU worker grid) where parallel threads might otherwise try to rewrite cache tokens simultaneously.

## 3. Targeted SLA Modeling & Resiliency Guardrails (Task B)

This framework treats application latency as a deterministic parameter via explicit programmatic gates rather than using fragile framework hacks.

* **Zero Anti-Patterns:** Hardcoded sleep statements (page.waitForTimeout) are banned across the codebase to optimize compute resource allocation.
* **Isolated SLA Assertions:** The performance_glitch_user displays a strict 5-second server-side database delay. To prevent this account bottleneck from forcing you to inflate timeouts for the entire test suite, a local timeout wrapper is declared at the pinpoint layer:

await expect(inventory.productGrid).toBeVisible({ timeout: 6000 });

This establishes a tight 6000ms Service Level Agreement (5-second latency window + 1-second rendering overhead buffer) that fails immediately if application performance degrades further, while allowing standard healthy profiles to pass at high-speed.

## 4. Observatory Infrastructure & Failure Artifacts

The system decouples diagnostic visibility from the core testing layer by managing execution assets globally inside playwright.config.ts:

* **Failure Screenshots:** Configured to capture screenshots exclusively only-on-failure. If a spec block encounters an unhandled state, the framework takes a PNG capture and routes it directly to the designated test-results/ folder, preventing asset bloat for passing steps.
* **Trace Records:** Set to capture detailed diagnostics on-first-retry to ensure deeper debugging insights (network logs, call stacks, console output) are available for pipeline errors without impacting overall performance.

## 5. Local Setup & Execution Guide

**Prerequisites:**
* Node.js v18+ or v20+
* Ubuntu Linux / macOS / Windows Terminal

**Installation**
Clone the repository and initialize the isolated lockfile dependencies:

Bash
npm ci

**Download and register the matching headless browser binaries:**

Bash
npx playwright install --with-deps

**Running Tests Locally**
Execute the entire regression matrix across Chromium and Firefox utilizing full parallel multi-threading:

Bash
npx playwright test

**Execute a targeted specification file (e.g., core customer journeys):**

Bash
npx playwright test tests/e2eWorkflows.spec.ts

**Viewing Artifacts and Reports**
Open the fully interactive local HTML reporting viewer to audit metrics, step timing, or inspect failure screenshots:

Bash
npx playwright show-report

##6. Continuous Integration (CI/CD) Pipeline

A dedicated GitHub Actions quality gate is defined in .github/workflows/playwright.yml.

* **Trigger Boundaries:** Automatically executes on every single code push and pull_request targeting the main branch.
* **Pipeline Lifecycles:** Pins a headless Ubuntu environment, provisions an optimal execution cache layer for Node dependencies, sets up the system browser packages, runs the multi-browser testing grid parallelized, and attaches failure reports as downloadable build logs automatically.


