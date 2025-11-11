# Branding Customization Guide

This guide explains how to customize the application's logo and title.

## Configuration File

All branding settings are centralized in `src/shared/config/branding.ts`.

## Customizing the Application Title

Update the `title` property:

```typescript
export const branding = {
  title: 'Your App Name',
  // ...
}
```

## Customizing the Logo

You have two options for the logo: SVG or Image.

### Option 1: Using an SVG Logo

Set `type` to `'svg'` and provide the SVG path data:

```typescript
export const branding = {
  title: 'Your App Name',
  logo: {
    type: 'svg',
    svgPath: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959...',
    width: 'w-8',
    height: 'h-8',
    color: 'text-primary'
  }
}
```

**Finding SVG Path Data:**
1. Open your SVG file in a text editor
2. Look for the `<path d="...">` element
3. Copy the value of the `d` attribute
4. Paste it as the `svgPath` value

### Option 2: Using an Image Logo

Set `type` to `'image'` and provide the image URL:

```typescript
export const branding = {
  title: 'Your App Name',
  logo: {
    type: 'image',
    imageUrl: '/logo.png', // or '/assets/logo.svg'
    width: 'w-8',
    height: 'h-8',
    color: 'text-primary' // Not used for images
  }
}
```

**Image Requirements:**
- Place your logo in the `public` folder (e.g., `public/logo.png`)
- Reference it with a leading slash (e.g., `/logo.png`)
- Recommended size: 32x32px or larger (will be scaled to fit)
- Supported formats: PNG, SVG, JPG, WebP

## Logo Styling

Customize the logo appearance using Tailwind CSS classes:

- `width`: Logo width (e.g., `'w-8'`, `'w-10'`, `'w-12'`)
- `height`: Logo height (e.g., `'h-8'`, `'h-10'`, `'h-12'`)
- `color`: SVG stroke color using Tailwind classes (e.g., `'text-primary'`, `'text-blue-500'`)

## Example Configurations

### Using a Custom SVG Icon

```typescript
export const branding = {
  title: 'MyCompany Admin',
  logo: {
    type: 'svg',
    svgPath: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
    width: 'w-10',
    height: 'h-10',
    color: 'text-blue-600'
  }
}
```

### Using a PNG Logo

```typescript
export const branding = {
  title: 'MyCompany Admin',
  logo: {
    type: 'image',
    imageUrl: '/company-logo.png',
    width: 'w-12',
    height: 'h-12',
    color: 'text-primary'
  }
}
```

## Where the Logo Appears

The logo and title are displayed in:
- Sidebar header (desktop and mobile)
- Collapsed when the sidebar is minimized (only the collapse button shows)

## Testing Your Changes

After updating the branding configuration:

1. Save the `branding.ts` file
2. The development server will hot-reload automatically
3. Check the sidebar to see your new logo and title
4. Test the collapsed sidebar state to ensure it looks good

## Troubleshooting

**Logo not showing:**
- Verify the image path is correct (starts with `/` for public folder)
- Check browser console for 404 errors
- Ensure the image file exists in the `public` folder

**SVG path not rendering correctly:**
- Verify you copied the complete `d` attribute value
- Check that the SVG viewBox is `0 0 24 24` (standard for most icons)
- Try using a simpler SVG path first to test

**Logo size issues:**
- Adjust the `width` and `height` Tailwind classes
- Use consistent values (e.g., both `w-8 h-8`)
- For images, ensure the source file has good resolution
