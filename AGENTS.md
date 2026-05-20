# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v55.0.0/ before writing any code.

# SOLID Is Mandatory

When writing, editing, or refactoring code in this repository, always follow SOLID principles. Treat SOLID compliance as a hard requirement, not a preference.

- Single Responsibility Principle: every module, class, hook, component, and function must have one clear responsibility.
- Open/Closed Principle: extend behavior through composition, abstraction, or configuration instead of modifying stable code paths unnecessarily.
- Liskov Substitution Principle: derived implementations must preserve the expected behavior and contracts of the abstractions they replace.
- Interface Segregation Principle: prefer small, focused interfaces and avoid forcing consumers to depend on methods or props they do not use.
- Dependency Inversion Principle: depend on abstractions, injected collaborators, and clear boundaries instead of concretely coupling high-level logic to low-level details.

Additional enforcement rules:

- Do not introduce quick fixes that violate SOLID even if they appear faster.
- If a requested change would push the design outside SOLID, stop and restructure the solution before continuing.
- Prefer composition over inheritance unless inheritance is the clearest SOLID-compliant model.
- Keep business logic, UI logic, side effects, and infrastructure concerns separated.
- Avoid god objects, oversized components, and utility modules that accumulate unrelated responsibilities.
- When adding new code, design for testability and replaceability through clear seams and narrow contracts.
- If the user requests a code change that falls outside industry standards or established best practices, do not implement it on the first request.
- In that case, explicitly refuse the request, state that it is outside industry standards, and provide the correct, realistically maintainable alternative that should be implemented instead.
- Only implement the user's original non-standard request if the user insists again after that initial refusal and recommendation.
- If creating shared UI elements such as inputs, select boxes, form controls, buttons, modals, or similar repeated interface primitives, build them as global reusable components first.
- Use those global components consistently across the application and do not duplicate the same UI logic or structure in multiple screens or local components.
- Always prefer reusable components and shared abstractions over copy-pasted implementations.
- Check component size while writing code and keep component files under 500 lines whenever reasonably possible.
- If a component grows too large or crosses 500 lines, split it into smaller focused components, hooks, or helper modules with clear responsibilities.

# Standards Decision Sources

When deciding whether something is industry-standard, best-practice, secure, or maintainable, use the following sources of truth in this order:

- Expo SDK 55 official documentation: https://docs.expo.dev/versions/v55.0.0/
- Tamagui official documentation: https://tamagui.dev/
- Official documentation for the exact library in use.
- React and React Native official documentation.
- Apple App Store and Google Play platform requirements.
- Established mobile security and web security best practices for auth, payments, and sensitive data handling.

If a requested implementation conflicts with these sources, prefer the safer and more maintainable implementation first, explain why, and only do the non-standard version if the user insists again.

# Required Tech Stack

For this project, use a scalable architecture where each library has one clear responsibility. Do not replace these choices with ad hoc alternatives unless the user explicitly asks for a stack change.

- Routing: use Expo Router for file-based routing, deep linking, and shareable product/detail URLs.
- Server state and caching: use TanStack Query (React Query) for product lists, pagination, infinite scroll, detail caching, mutations, and all remote async state.
- Client global state: use Zustand for cart state, auth/session state, and UI-level global filters or preferences.
- Secure local storage: use Expo SecureStore for JWT tokens and other sensitive credentials.
- Fast local storage: use React Native MMKV for cart persistence, app settings, and other fast read/write local data.
- List performance: use FlashList for product feeds, category results, and other heavy scrolling commerce lists instead of default FlatList when performance matters.
- Images: use Expo Image for product and marketing visuals so disk and memory caching are handled consistently.
- Forms and validation: use React Hook Form with Zod for checkout, auth, profile, and other validated forms.
- If a selected native library is not supported in Expo Go, do not let the app crash in Expo Go during development. Either require a development build explicitly or provide a safe development fallback while preserving the production architecture.

# Required Folder Architecture

As the codebase grows, follow a feature-driven structure. Features must keep their own components, store logic, and API hooks close together while shared UI stays global.

Preferred structure:

```text
/src
  /app                  # Expo Router structure
    /(tabs)             # Bottom tabs (Home, Categories, Cart, Profile)
    /product
      /[id].tsx         # Dynamic product detail page
    /checkout
      /index.tsx        # Checkout flow
  /components           # Global UI components (Button, Input, ProductCard)
  /features             # Feature-based modules
    /cart
      /components       # Cart-specific components (CartItem, CartSummary)
      /store            # Zustand cart store (useCartStore.ts)
    /product
      /api              # React Query hooks (useGetProducts, useGetProductById)
      /components       # ProductGrid, ProductFilters
  /lib                  # Third-party library setup (axios.ts, queryClient.ts)
  /services             # API endpoint definitions
  /types                # TypeScript types and interfaces (Product, User, Cart)
  /utils                # Formatters and helpers (formatCurrency.ts, validateTcNo.ts)
```

Architecture enforcement rules:

- Keep shared, reusable UI primitives in `/src/components`.
- Keep feature-specific UI, hooks, stores, and API hooks inside their own `/src/features/<feature>` directory.
- Keep third-party configuration and app-wide clients inside `/src/lib`.
- Keep endpoint definitions and service-level request builders inside `/src/services`.
- Keep shared domain types inside `/src/types`.
- Keep pure helper utilities inside `/src/utils`.
- Do not place unrelated business logic directly inside route files when it belongs to a feature module.

# Data Flow And Integration Rules

Use the following architectural rules as project standards.

Cart management with Zustand and MMKV:

- The cart must persist even after the user closes the app.
- Persist the Zustand cart store using MMKV-backed persistence.
- Adding or removing cart items should update client state immediately through Zustand.
- If the backend also needs cart state, synchronize it asynchronously through TanStack Query mutations at the correct flow boundaries such as checkout or explicit server-side cart sync.

API layer with Axios and TanStack Query:

- Do not call `fetch` or raw `axios` directly inside screen or component bodies for application data flows.
- Create and use a shared Axios instance in `/src/lib/axios.ts`.
- Handle token injection, interceptors, and common error handling inside that shared Axios client.
- Components and screens should consume custom hooks such as `useGetProducts()` or `useGetProductById()` instead of embedding request logic inline.

Payment integration rules:

- Treat payments as a critical domain with explicit boundaries and no ad hoc client-side card handling.
- If a provider offers a suitable React Native or Expo-compatible native SDK, prefer that integration path.
- For 3D Secure or hosted payment flows, start the payment on the backend and open the returned HTML content or payment URL inside `react-native-webview`.
- Listen to WebView navigation changes to detect payment completion and then return the user to the native application flow safely.
- Do not process sensitive card data locally in custom insecure flows when a provider-hosted or native SDK flow is available.

# Release And CI/CD Standards

Configure the project with Expo Application Services (EAS) from the beginning.

- Use EAS Build to generate cloud builds for iOS and Android.
- Maintain `eas.json` with at least `development`, `preview`, and `production` profiles.
- Use EAS Update for OTA releases so urgent UI fixes and text fixes can be delivered without waiting for app store approval when appropriate.

# Quality And Engineering Standards

- If this rule file defines a required library or architectural dependency, install and configure that dependency before implementing a weaker temporary alternative.
- The application should include tests so defects can be detected earlier and critical flows can be verified continuously.
- Add tests for critical business logic, stores, validators, schemas, pure utility functions, and interactive reusable components.
- For components, write tests when they contain user interaction, state transitions, conditional rendering, form behavior, data transformation, or other meaningful logic.
- Purely visual wrapper components with no meaningful logic do not always require dedicated tests, but shared interactive primitives should be tested.
- If a reusable interactive component is theme-aware or changes appearance across light and dark modes, test that its key labels, icons, and interactive content still render correctly after theme changes.
- For bug fixes, add a regression test whenever the affected layer can be tested reasonably.
- After theme, navigation, layout shell, provider, or reusable UI changes, verify the affected flows in the running app instead of relying only on typecheck and tests.
- Every remote-data screen and async flow must explicitly handle `loading`, `error`, `empty`, and `success` states.
- Do not allow silent failures for API requests, persistence, checkout steps, auth flows, or cart synchronization.
- Centralize environment configuration and validate required environment variables at startup or configuration load time.
- Follow consistent naming conventions: components in `PascalCase`, hooks in `useX`, stores in `useXStore`, schemas in `*.schema.ts`, and shared types in `*.types.ts`.

# TanStack Query And API Architecture Standards

- Define TanStack Query keys through feature-scoped key factories such as `productKeys.list(filters)` and `productKeys.detail(id)`.
- Keep query key definitions stable, predictable, and colocated with the owning feature or API layer.
- Do not scatter ad hoc inline query keys across unrelated files.
- Map backend DTOs and raw API responses into domain-friendly models before they reach screen or presentational component layers.
- UI components should consume stable domain models instead of depending directly on raw backend response shapes.

# Auth And Security Standards

- Store JWT tokens and other sensitive credentials only in Expo SecureStore.
- Do not store auth tokens in MMKV, plain async storage, component state snapshots, logs, or insecure caches.
- Centralize login, logout, token refresh, and session restoration logic behind a clear auth boundary.
- Protect authenticated routes and privileged flows through centralized auth checks instead of scattering manual checks across screens.

# Tamagui UI Standards

This application must use Tamagui as its primary and enforced UI system. The product is a mobile e-commerce application, and all UI work must align with Tamagui's official patterns and recommendations.

- Build every screen and reusable UI element with Tamagui components, primitives, themes, tokens, variants, and `styled()` patterns whenever possible.
- Prefer Tamagui primitives such as `Stack`, `XStack`, `YStack`, `ZStack`, `Text`, `Button`, `Input`, and other Tamagui-first building blocks for application UI.
- If a non-Tamagui native or third-party view is required, wrap it behind a clean abstraction and integrate it with the Tamagui theme and token system instead of scattering raw usage across screens.
- Support both light theme and dark theme for every screen, state, and reusable component.
- Theme support is not considered complete until the screen is visually checked in both light mode and dark mode and all core surfaces remain readable.
- Safe areas, status bar styling, tab bars, navigation containers, modal surfaces, cards, sheets, and scroll containers must follow the active theme and must not stay stuck in light colors while the rest of the UI is dark, or vice versa.
- Shared buttons, toggles, segmented controls, tabs, icons, and text labels must maintain readable contrast in both themes.
- Shared interactive UI primitives such as buttons, segmented controls, toggles, tabs, and similar controls must not rely on implicit default text or icon coloring when theme changes can make content unreadable.
- If text or icon contrast needs to be enforced for reliability, define that behavior inside the reusable component itself instead of patching individual screens.
- Theme switching must preserve content visibility. Labels, icons, and other button content must not disappear, collapse, clip unexpectedly, or become unreadable after changing between light and dark modes.
- Reusable theme-aware interactive components should be verified not only for static appearance but also for transition correctness after switching themes.
- When a reusable segmented control, toggle group, or tab-like component is created, ensure its layout remains stable and each segment has enough space for its icon and label in both themes.
- Do not hard-code colors, spacing, radii, typography sizes, shadows, or similar design values when a token or theme value should be used instead.
- Prefer theme values and tokens over raw style literals so design stays consistent and theme-aware.
- Use Tamagui theme and token APIs for styling decisions, and use `useTheme()` only when runtime theme access is actually needed.
- Do not call Tamagui token readers or theme-dependent APIs at module scope in a way that can run before Tamagui has been initialized for the app. Theme-dependent reads should happen through provider-safe code paths or centralized helpers that do not break runtime initialization.
- Prefer reusable `styled()` components and variants over repetitive one-off styling.
- Avoid building screen layouts with raw React Native `View`, `Text`, or `StyleSheet` for normal app UI when Tamagui components can express the same result.
- Keep theme definitions, tokens, and design primitives centralized so style behavior is predictable across the entire application.
- If a reusable UI primitive needs explicit text or icon styling for contrast, define that behavior inside the reusable component so screens do not have to patch theme issues locally.

# Accessibility And Observability Standards

- Reusable UI components must include accessible labels, roles, focus behavior, and touch targets appropriate for mobile usage.
- Do not ship shared interactive components that are visually correct but inaccessible.
- Track key commerce events through a consistent analytics vocabulary, including product views, search, filter usage, add-to-cart, remove-from-cart, checkout start, payment result, and order completion.
- Plan for crash and error visibility in critical flows such as auth, product browsing, cart, and checkout.

# Commerce Product Standards

This app is intended to be a Trendyol-like mobile e-commerce experience. Product, UX, architecture, and performance decisions should support that goal.

- Prioritize high-performance catalog browsing, category discovery, product detail pages, cart, checkout, profile, and order-related flows.
- Product lists and campaign feeds must be optimized for heavy scrolling, pagination, and cached media loading.
- Product, category, and campaign navigation should be shareable and deep-link friendly.
- Price, discount, stock, shipping, seller, and campaign-related information should be modeled and presented clearly where relevant.
- Cart behavior must feel immediate, persistent, and reliable even under unstable network conditions.
- Checkout flows should minimize friction, surface validation clearly, and preserve user trust through explicit loading and payment states.
- Design decisions should favor fast product discovery, conversion clarity, and mobile-first usability over ornamental complexity.
