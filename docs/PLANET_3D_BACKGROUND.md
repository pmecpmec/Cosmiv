# 3D Planet Background Documentation

## Overview

The `Planet3DBackground` component is a lightweight, performant 3D rotating planet background for Cosmiv. It replaces the previous 2D canvas-based `CosmicBackground` with a modern 3D implementation using React Three Fiber.

## Features

✅ **Slow Continuous Rotation** - Planet rotates smoothly even when user is idle/AFK  
✅ **Cosmiv Theme Integration** - Uses brand colors (violet, deep blue, neon cyan)  
✅ **Low-Poly Geometry** - 32-segment sphere for optimal performance  
✅ **Procedural Shader Materials** - Custom gradient shaders matching Cosmiv aesthetic  
✅ **Subtle Starfield** - Lightweight particle system (3000 stars)  
✅ **Atmospheric Glow** - Soft glow effect around planet  
✅ **Non-Intrusive** - `pointer-events: none` so it doesn't block UI interactions  
✅ **Performance Optimized** - Limited pixel ratio, no antialiasing, efficient rendering

## Usage

The component is already integrated into `App.jsx`:

```jsx
import Planet3DBackground from './components/Planet3DBackground'

// In your component:
<Planet3DBackground />
```

## Component Structure

```
Planet3DBackground.jsx
├── Planet()           - Main rotating sphere with shader material
├── Atmosphere()       - Outer glow layer
├── Starfield()        - Background star particles
└── Lighting()         - Ambient, directional, and point lights
```

## Performance Optimizations

1. **Low Polygon Count**: Sphere uses 32 segments (not 64+) for lower vertex count
2. **Shader Materials**: Efficient custom shaders instead of texture loading
3. **No Antialiasing**: Disabled for performance on lower-end devices
4. **Limited Pixel Ratio**: `dpr={[1, 2]}` prevents excessive rendering on high-DPI displays
5. **Reduced Star Count**: 3000 stars (down from 5000) for better performance
6. **Efficient Animation**: Uses `useFrame` with delta time for smooth rotation

## Customization

### Adjusting Rotation Speed

Edit the rotation speed in `Planet()` component:

```jsx
// In Planet component's useFrame:
meshRef.current.rotation.y += delta * 0.05  // Change 0.05 to adjust speed
```

### Changing Colors

Modify the `COLORS` constant at the top of the file:

```jsx
const COLORS = {
  violet: '#8B5CF6',      // Cosmic violet
  deepBlue: '#1E3A8A',    // Deep blue
  neonCyan: '#00FFFF',    // Neon cyan
  pink: '#FF0080',        // Glitch pink
  dark: '#0A1A2A',        // Background
}
```

### Adjusting Star Count

In `Starfield()` component:

```jsx
<Stars
  count={3000}  // Change this number
  // ... other props
/>
```

### Changing Planet Size/Position

In `Planet()` component:

```jsx
<Sphere 
  args={[2, 32, 32]}      // [radius, widthSegments, heightSegments]
  position={[0, 0, -3]}   // [x, y, z] position
/>
```

## Troubleshooting

### Component Not Rendering

1. **Check browser console** for WebGL errors
2. **Verify dependencies** are installed: `npm list @react-three/fiber @react-three/drei three`
3. **Check GPU acceleration** is enabled in browser settings
4. **Try disabling other heavy animations** to rule out performance conflicts

### Performance Issues

1. **Reduce star count**: Change `count={3000}` to `count={1500}`
2. **Increase planet segments**: Change `args={[2, 32, 32]}` to `args={[2, 16, 16]}` for fewer polygons
3. **Disable stars**: Comment out `<Starfield />` component
4. **Reduce pixel ratio**: Change `dpr={[1, 2]}` to `dpr={1}`

### Visual Issues

1. **Planet too dark/bright**: Adjust light intensities in `Lighting()` component
2. **Colors not matching**: Verify `COLORS` constant matches Cosmiv theme
3. **Planet clipping**: Adjust camera position or planet `position` prop

## Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest, requires WebGL 2.0)
- ⚠️ Older browsers may not support WebGL 2.0

## Future Enhancements

Potential improvements (not yet implemented):

- [ ] Texture mapping instead of shader gradients
- [ ] More complex planet surface (craters, terrain)
- [ ] Dynamic lighting based on user interaction
- [ ] Multiple planets or celestial bodies
- [ ] Parallax effect on scroll
- [ ] WebGL fallback for older browsers

## File Locations

- **Component**: `src/components/Planet3DBackground.jsx`
- **Integration**: `src/App.jsx` (line 80)
- **Legacy Component** (still exists but commented out): `src/components/CosmicBackground.jsx`

## Dependencies

- `@react-three/fiber@8.15.19` - React renderer for Three.js
- `@react-three/drei@9.88.13` - Useful helpers (Stars, Sphere components)
- `three@0.160.0` - Core 3D library

## Maintenance Notes

- Component uses React hooks (`useRef`, `useMemo`, `useFrame`) for optimal performance
- Material uniforms are updated in `useFrame` for smooth animation
- No external textures required (fully procedural)
- Component is self-contained and easy to maintain

## Performance Benchmarks

Expected performance on modern hardware:
- **Desktop (GTX 1060+)**: 60 FPS stable
- **Desktop (integrated GPU)**: 45-60 FPS
- **Mobile (high-end)**: 30-45 FPS
- **Mobile (mid-range)**: 20-30 FPS

If performance is below expectations, reduce star count or polygon count.

---

**Last Updated**: 2025-01-27  
**Component Version**: 1.0.0  
**Maintained By**: AI Assistant (Auto)

