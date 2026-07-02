# AI-Assisted Engineering & Validation Log

This registry documents how large language models (LLMs) were leveraged during the construction of this automation suite. Rather than using AI for blind code generation, tools were used as a pair-programming partner for rapid boilerplate scaffolding, environment troubleshooting, and edge-case brainstorming. 

Below are the key prompts, along with the critical human engineering reviews and corrections applied to the outputs.

---

## Session 1: Architectural Scaffolding & Base Configurations

### Objective
Establish the initial file structure and base configuration mapping for Task A, ensuring strict layer separation and compliance with the Nuaav evaluation criteria.

### Prompt Supplied to AI
> "Act as a Senior QA Automation Architect. I need to scaffold a Playwright automation project in TypeScript for SauceDemo. Provide a standard playwright.config.ts file that supports fully parallel runs, captures screenshots only on failure saved to a test-results/ directory, runs 1 retry in CI via process.env.CI check, and maps chromium and firefox. Keep the configuration clean and decoupled from specific hardcoded test logic."

### Critical Human Engineering Review & Validation Applied
* **AI Output Defect Caught:** The initial configuration suggested by the LLM omitted the global root `use.baseURL` configuration layer and instead hardcoded full URLs (`https://www.saucedemo.com/inventory.html`) inside the individual Page Object navigation methods.
* **Engineering Action Taken:** I rejected the hardcoded page navigations to protect the suite against environment fracturing. I explicitly moved the target root URL into the configuration's centralized `use` block (`baseURL: 'https://www.saucedemo.com'`) and refactored the page models to navigate using clean relative path resolutions (`this.page.goto('/')`).

---

## Session 2: State Isolation via Custom Dependency Injection (Fixtures)

### Objective
Implement the `storageState` caching engine required by Task A to serialize the authenticated `standard_user` state exactly once and share it across multiple isolated browser workers.

### Prompt Supplied to AI
> "I want to implement a custom Playwright test extension fixture using test.extend. It needs to check if an auth session file exists on disk. If it doesn't, it should perform a programmatically decoupled login using the standard_user credentials, save the storageState into a local json file, and then hydrate subsequent browser workers with that session state so tests don't have to hit the UI login screen over and over."

### Critical Human Engineering Review & Validation Applied
* **AI Output Defect Caught:** The LLM provided path strings using legacy CommonJS variables (`__dirname` and `__filename`), which crashed the Node.js compiler upon test discovery with a `SyntaxError: Cannot use 'import.meta' outside a module`.
* **Engineering Action Taken:** Recognizing that this project boundary runs as a modern EcmaScript Module (ESM) due to the `"type": "module"` flag inside our isolated package manifest, I overrode the AI's boilerplate. I integrated explicit Node.js URL wrappers (`fileURLToPath` from 'url') to cleanly calculate paths on my Ubuntu filesystem. I also added missing recursive folder synchronization logic (`fs.mkdirSync(dir, { recursive: true })`) to prevent unhandled write exceptions (`ENOENT`) if the target `/auth` directory didn't exist prior to execution.

---

## Session 3: SLA Verification & Flakiness Prevention (Task B)

### Objective
Model a highly resilient, non-flaky verification workflow for the `performance_glitch_user` account, which is artificially degraded by a 5-second server-side delay.

### Prompt Supplied to AI
> "Write a test for the performance_glitch_user account. The application delays page rendering on this account. I want to make sure the test waits cleanly for the catalog page to load without causing a flake or resorting to hardcoded thread sleep statements."

### Critical Human Engineering Review & Validation Applied
* **AI Output Defect Caught:** The LLM suggested using global configuration overrides or introducing an explicit structural time hack (`await page.waitForTimeout(6000)`). This is a direct violation of production-grade automation standards because it introduces unnecessary, hardcoded execution padding to healthy test runs.
* **Engineering Action Taken:** I removed the suggested hardcoded wait completely. Instead, I applied a highly targeted locator timeout directly at the step layer assertion (`await expect(inventory.productGrid).toBeVisible({ timeout: 6000 })`). This establishes a tight 6000ms Service Level Agreement (SLA) window (5-second bottleneck + 1-second network/rendering buffer) which fails fast if performance degrades further, but passes immediately the moment the elements materialize.

---

## Session 4: Debugging StorageState Asynchronous Race Conditions

### Objective
Resolve global test failures where workers using pre-authenticated states were redirected to the login screen and timed out.

### Prompt Supplied to AI
> "My tests using the authenticatedPage fixture are failing with timeouts waiting for inventory elements. The error says 'Test timeout of 30000ms exceeded' and it's stuck on waiting for the backpack add-to-cart locator. Why is storageState not skipping the login screen?"

### Critical Human Engineering Review & Validation Applied
* **AI Output Defect Caught:** The AI initially hypothesized that SauceDemo uses uncacheable `sessionStorage` or that the base URL was improperly declared, suggesting I rewrite the authentication layer to use traditional UI login hooks inside a global `beforeEach`.
* **Engineering Action Taken:** I rejected abandoning the `storageState` design rule required by Task A. I analyzed the system behavior and identified that the issue was an automation race condition. The framework was saving the storage state file immediately after clicking the login button, capturing an empty unauthenticated snapshot. I fixed this by implementing an explicit URL verification gate (`await setupPage.waitForURL(/.*inventory.html/)`) to ensure session state hydration occurs only after state cookies settle in the browser domain.

---

## Session 5: Transitioning to Native Project Dependencies (Task A Refactor)

### Objective
Eliminate infrastructure logic bleeding into the fixture layer and prevent potential multi-worker file write collisions on CI/CD pipelines.

### Prompt Supplied to AI
> "I want to move the authentication cache generation entirely out of my custom test fixtures and use native Playwright Project Dependencies instead. Provide a setup specification mapping (auth.setup.ts) and a revised playwright.config.ts project matrix that ensures the setup step executes strictly before any parallel workers spin up."

### Critical Human Engineering Review & Validation Applied
* **AI Output Defect Caught:** The LLM's suggested configuration reintroduced legacy CommonJS global path tracking variables (`__dirname`) inside an ES Module scope, causing immediate runtime crashes (`ReferenceError: __dirname is not defined in ES module scope`). Additionally, the proposed `auth.setup.ts` file used an invalid path resolution to import the page components by omitting the core `src/` container path.
* **Engineering Action Taken:** I corrected the compilation errors by overriding the file reference strategies. I refactored the file parsing inside `playwright.config.ts` to leverage modern, ESM-safe native path methods (`path.resolve('auth/standard_user.json')`). I then fixed the broken import string in the setup script to explicitly map the sibling layout directory boundary (`../src/pages/LoginPage.ts`).

---

## Session 6: Resolving Base URL Configuration Inheritance

### Objective
Restore global relative route path resolutions across Chromium and Firefox workers after restructuring project execution blocks.

### Prompt Supplied to AI
> "After implementing the setup project dependencies, all 12 of my standard downstream parallel tests are instantly throwing 'Protocol error: Cannot navigate to invalid URL' when trying to run page.goto('/') or page.goto('/inventory.html'). Why did my routes break?"

### Critical Human Engineering Review & Validation Applied
* **AI Output Defect Caught:** The AI initially assumed that the browser storage state file was corrupted or that the relative slash path string parsing configuration inside the spec files was invalid, recommending I fallback to absolute string configurations inside every single test case.
* **Engineering Action Taken:** I rejected hardcoding full paths inside individual test files, as it violates clean configuration practices. I performed a root-cause config trace and discovered that during the project-dependency migration, the global `use` block mapping was nested incorrectly, causing the project suites to drop their relative base context. I restored the `use: { baseURL: 'https://www.saucedemo.com' }` wrapper directly to the configuration object root, ensuring all parent and child execution workers uniformly inherit identical protocol routing scopes.

---

## Summary of Engineering Governance
Every line of code within this repository was validated locally using structural type-checking and regression tested via `npx playwright test` on an isolated Ubuntu environment. The AI was directed as an accelerator, while structural architecture, data separation, and platform maintainability boundaries were governed entirely by the engineer.
