# Trustpilot Integration Setup

This document explains how Trustpilot is integrated into the LumiMeds Next.js project.

## What's Implemented

✅ **Trustpilot Review Display Widget** - Shows your Trustpilot rating and reviews on the website
✅ **Script Loading** - Trustpilot script is loaded in the main layout
✅ **Configuration Management** - All settings are centralized in `constants/trustpilot.ts`
✅ **Responsive Design** - Widget is styled to match your Bootstrap-based design

## Files Modified

1. **`app/layout.tsx`** - Added Trustpilot script loading
2. **`components/Home/Hero/index.tsx`** - Added Trustpilot widget to hero section
3. **`components/Home/Hero/TrustpilotWidget.tsx`** - Created the widget component
4. **`components/Home/Hero/styles.css`** - Added styling for the widget
5. **`constants/trustpilot.ts`** - Centralized configuration

## Configuration

All Trustpilot settings are managed in `constants/trustpilot.ts`:

```typescript
export const TRUSTPILOT_CONFIG = {
  BUSINESS_UNIT_ID: '66d73baba384aee5c4b3b6bb',
  TEMPLATE_ID: '5419b6ffb0d04a076446a9af',
  HEIGHT: '20px',
  WIDTH: '100%',
  TOKEN: 'f6eb6116-e52a-4d61-9924-56d186bdba04',
  REVIEW_URL: 'https://www.trustpilot.com/review/lumimeds.com',
  SCRIPT_URL: '//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js',
};
```

## Widget Placement

The Trustpilot widget is currently placed in the Hero section above the "Get Started" button. This provides social proof and builds trust for visitors.

## Customization Options

### Change Widget Location

To move the widget to a different location, simply import and use the `TrustpilotWidget` component:

```tsx
import TrustpilotWidget from '@/components/Home/Hero/TrustpilotWidget';

// Use anywhere in your components
<TrustpilotWidget />;
```

### Customize Widget Properties

You can override the default configuration:

```tsx
<TrustpilotWidget height='40px' width='300px' businessUnitId='custom-id' />
```

### Different Widget Templates

Trustpilot offers various widget templates. To change the template:

1. Go to your Trustpilot Business account
2. Navigate to Widgets section
3. Choose a different template
4. Copy the new `template-id`
5. Update `TEMPLATE_ID` in `constants/trustpilot.ts`

## Available Widget Types

- **Micro Combo** (current) - Compact rating display
- **Review Collector** - Allows customers to leave reviews
- **TrustBox** - Social proof and trust signals
- **Carousel** - Scrollable review carousel
- **Grid** - Grid layout of reviews

## Troubleshooting

### Widget Not Loading

1. Check browser console for errors
2. Verify the script is loading in `app/layout.tsx`
3. Ensure your Trustpilot Business account is active
4. Check if the business unit ID is correct

### Styling Issues

1. Check `components/Home/Hero/styles.css` for custom styles
2. Verify Bootstrap classes are working
3. Check responsive breakpoints in CSS

### Performance

- The widget script loads asynchronously with `strategy='afterInteractive'`
- Widget is lightweight and shouldn't impact page performance
- Consider lazy loading if you have multiple widgets

## Next Steps

To enhance the Trustpilot integration, consider:

1. **Review Collection** - Add review collection widgets to checkout or thank you pages
2. **TrustBox** - Display trust signals on product pages
3. **Review Carousel** - Show rotating reviews on the homepage
4. **Analytics** - Track widget interactions and conversions

## Support

For Trustpilot-specific issues:

- [Trustpilot Business Support](https://business.trustpilot.com/support)
- [Widget Documentation](https://business.trustpilot.com/reviews/collecting/trustbox)

For implementation issues:

- Check the component code in `components/Home/Hero/TrustpilotWidget.tsx`
- Review the configuration in `constants/trustpilot.ts`
- Check browser console for JavaScript errors
