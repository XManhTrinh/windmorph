# androidx.graphics.shapes (TypeScript port)

The files in this directory are a TypeScript port of
[`androidx.graphics.shapes`](https://android.googlesource.com/platform/frameworks/support/+/refs/heads/androidx-main/graphics/graphics-shapes/)
and of `MaterialShapes` from Jetpack Compose Material 3, ported from androidx commit
`120345129e90f25b882c45a187e4229b885ce1b5`.

Copyright 2022–2025 The Android Open Source Project.
Licensed under the Apache License, Version 2.0 (https://www.apache.org/licenses/LICENSE-2.0).
Modified:

- Translated to TypeScript; Kotlin `Float` arithmetic became JavaScript `number` (64-bit).
- The SVG path parser, feature serializer, feature detector and polygon validation were not
  ported.
- `RoundedPolygon.calculateBounds` seeds its min/max with ±Infinity (upstream seeds the max
  with `Float.MIN_VALUE`, the smallest _positive_ float, which mis-bounds shapes lying entirely
  in negative space).
- `MaterialShapes` is a lazily built, cached object keyed by shape name, and Compose `Matrix`
  transforms became point-transformer functions.
- `path.ts` ports Compose's internal `ShapeUtil.kt` path builder but emits SVG path data
  (coordinates rounded to 4 decimals), and rotates about the pivot rather than the origin,
  since SVG has no re-centering step after the rotation.
