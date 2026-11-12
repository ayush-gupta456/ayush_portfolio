# Portfolio refinement

Approved direction: evolve the existing dark/light portfolio, retain its portrait and sections, and feature Raaga and InsightCode while keeping PassOp.

Use the existing React/Vite stack with Framer Motion for staged hero entrances, project reveals, navigation feedback and toolkit transitions. Keep keyboard navigation, small-screen layouts and reduced-motion support. Replace competing animations on motion-owned elements. Present illustrative product previews without claiming they are live application screenshots.

Refresh project facts from the repositories' current READMEs. The API owns profile content: migrate its legacy project list once, preserve unrelated content and uploaded images, and allow subsequent admin edits/removals. Support a frontend deployed before the updated API through the same versioned refresh.

Alternatives considered: a full layout/palette redesign or targeted refinement. Refinement was recommended and accepted because the existing site already has a coherent identity and working notebook/contact/admin flows.

Validation: project migration tests, frontend lint/build, existing backend tests where dependencies permit, responsive browser checks, keyboard navigation, both themes and reduced motion. Deliver on a review branch without merging or publishing production.
