# Exercise SVG artwork — local review only

- 200 catalog IDs, 91 mapped to the **user-supplied** file's 143 scenes and re-authored with revised tracks, 109 new locally generated pose illustrations, covering the starter catalog including all 25 stretches. The 52 unassigned source scenes remain reserved, not additional approved exercises.
- Original uploaded file remains untouched. The adapted engine preserves the illustration primitives and colors, drops embedded language/weight prescriptions, supports dark/light themes, and creates standalone SVG frames on demand.
- All 200 artwork tracks are **draft**, not validated technique or anatomical activation. All illustrations now use an articulated planar rig with fixed segment lengths, angular interpolation, contact-target solving and stable flexion branches. Corrections can use multiple key poses, cyclic alternating movements or static holds. The original 91 mapped scenes remain accessible via the source comparison function; original error animations are not enabled in any re-authored track. Apparatus is schematic, not a complete mechanical simulation.
- See [SVG remediation inventory](EXERCISE-SVG-REMEDIATION.md) for the post-audit status of every catalog ID. A rigged track is not the same as a specialist-approved exercise.
- No third-party image hosting, network requests, tracking, Supabase, database schema changes or public release. Local admin preview includes play/pause and phase control. The existing review/upload workflow remains unchanged.
- Before publication: verify permission to redistribute the supplied artwork; review each exercise's mapping, equipment, anatomy, contact points, motion continuity, instructions and error demonstrations with a qualified reviewer; adjust incorrect poses; confirm responsive layout and accessibility; implement explicit artwork approval if SVG is used as an alternative to video. Do not bypass the existing publication gate.

## Local extension

Use the stable exercise ID from `dist/core/exercise-catalog.js`. Add a validated source scene to `dist/core/exercise-drawings.js` or add a distinct start/end pose or multi-keyframe track and apparatus to the drawing registry. Update counts and tests when adding catalog exercises; do not substitute an unrelated movement for a missing drawing. All newly introduced assets start as drafts. The registry is independent of list size, so expanding the catalog does not require changing the SVG renderer.

Run `npm test` locally. Open the training catalog as an administrator, expand exercise details, then open the animated SVG preview. Verify both dark and light themes and Arabic, English and Swedish controls, at desktop and mobile viewport widths. 
