# Torque — interactive car explorer

A browser-based 3D explorer built with Vite and Three.js. Drag the exploded-view slider to separate a generic sports coupe into 75 individually selectable components, including 20 wheel bolts.

## Run locally

Requires Node.js 20.19+ or 22.12+ and npm.

```sh
npm ci
npm run dev
```

Open the address printed by Vite. The development server binds to `0.0.0.0` for cloud development.

## Explore

- Drag the model to orbit; scroll or use the +/− buttons to zoom.
- Use the slider or play button to assemble and disassemble the car.
- Click a 3D component or a part card to inspect its material and purpose.
- Isolate a component, hide it, or filter the assembly by system.
- Use X-ray mode to see through exterior panels.
- Search by name or material; press `/` to focus search and Escape to clear selection.
- Reset view restores all parts, filters, and camera settings.

The procedural model is illustrative, not a complete vehicle CAD assembly. Dimensions, materials, and descriptions are approximate and are not service specifications. No external models, API keys, or backend are required. Fonts are bundled locally.

## Verify

```sh
npm test
npm run build
npm run test:e2e
```

Browser tests use `/usr/bin/chromium` by default. Set `CHROMIUM_PATH` to use another installed Chromium executable. Tests cover 3D picking, part inspection, isolate/hide/reset, individual bolt filtering, slider animation, X-ray, and mobile layout.

`npm run preview` serves the production build after `npm run build`.
