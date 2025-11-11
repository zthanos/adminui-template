/**
 * Application branding configuration
 * Update these values to customize the application's logo and title
 */

export const branding = {
  /**
   * Application title displayed in the sidebar
   */
  title: 'Admin',

  /**
   * Logo configuration
   * You can either use an SVG path or an image URL
   */
  logo: {
    type: 'svg' as 'svg' | 'image',
    
    // For SVG: Provide the SVG path data
    svgPath: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z',
    
    // For image: Provide the image URL or path
    imageUrl: '/logo.png',
    
    // Logo dimensions
    width: 'w-8',
    height: 'h-8',
    
    // Logo color (for SVG only, uses Tailwind classes)
    color: 'text-primary'
  }
}
