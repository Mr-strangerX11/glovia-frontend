# Glovia UI Design System & Improvement Guide

## 📐 Component Library

The new component library in `/src/components/ui/` provides modernized, reusable components:

### Available Components

1. **Button** - Flexible button with 6 variants (primary, secondary, outline, ghost, danger, success)
   ```tsx
   import { Button } from '@/components/ui';
   <Button variant="primary" size="lg" fullWidth>
     Click me
   </Button>
   ```

2. **Card** - Container for grouped content with hover effects
   ```tsx
   import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
   <Card shadow="md" hover>
     <CardHeader>
       <CardTitle>Title</CardTitle>
     </CardHeader>
     <CardContent>Content here</CardContent>
   </Card>
   ```

3. **Input** - Enhanced form inputs with validation states
   ```tsx
   import { Input, TextArea, Select } from '@/components/ui';
   <Input 
     label="Email" 
     type="email" 
     error={emailError}
     required 
   />
   ```

4. **Badge** - Status indicators with 6 color variants
   ```tsx
   import { Badge } from '@/components/ui';
   <Badge variant="success">Active</Badge>
   ```

5. **Alert** - Notification boxes (success, error, warning, info)
   ```tsx
   import { Alert } from '@/components/ui';
   <Alert variant="error" title="Error" description="Something went wrong" dismissible />
   ```

6. **PageLayout** - Standardized page structure with header/breadcrumbs/actions
   ```tsx
   import { PageLayout, PageSection, PageGrid } from '@/components/ui';
   <PageLayout
     title="Products"
     subtitle="Manage your products"
     actions={<Button>Add Product</Button>}
   >
     <PageSection title="Featured">
       {children}
     </PageSection>
   </PageLayout>
   ```

## 🎨 Design Tokens

### Colors
- **Primary**: Rose/Pink (600-400 for interactive)
- **Secondary**: Cool Gray  
- **Success**: Emerald
- **Warning**: Amber
- **Danger**: Red
- **Info**: Blue

### Spacing
- xs: 0.5rem (2px)
- sm: 0.75rem (3px)
- md: 1rem (4px)
- lg: 1.5rem (6px)
- xl: 2rem (8px)

### Typography
- H1: 2rem bold (page title)
- H2: 1.5rem bold (section title)
- H3: 1.125rem semibold (subsection)
- Body: 1rem regular
- Small: 0.875rem (helper text)

### Shadows
- sm: shadow-sm (subtle)
- md: shadow-md (normal)
- lg: shadow-lg (prominent)

## 🛠️ Implementation Strategy

### Phase 1: Critical Pages (High Impact)
Priority pages to update using new components:
1. Home page (`/page.tsx`)
2. Product listing (`/products/page.tsx`)
3. Product details (`/products/[slug]/page.tsx`)
4. Shopping cart (`/cart/page.tsx`)
5. Checkout (`/checkout/page.tsx`)
6. Admin dashboard (`/dashboard/admin/page.tsx`)
7. Authentication pages (`/auth/*`)

### Phase 2: Customer Pages
- Account dashboard
- Orders page
- Wishlist
- Address management
- Referral page

### Phase 3: Admin Pages
- All `/admin/*` pages
- Product management
- Order management
- Analytics dashboards

### Phase 4: Vendor Pages
- Vendor dashboard
- Vendor product management
- Vendor analytics

### Phase 5: Info Pages
- About, Contact, Privacy, Terms
- Blog pages
- Vendor listings

## ✅ Quality Checklist for Page Updates

When updating a page, ensure:

- [ ] Uses new Button component (not inline styled buttons)
- [ ] Uses Card component for grouped content
- [ ] Input fields use Input/TextArea/Select components with validation
- [ ] Status indicators use Badge component
- [ ] Error/success messages use Alert component
- [ ] Page structure uses PageLayout wrapper
- [ ] Responsive design works mobile-first
- [ ] Consistent spacing using tailwind spacing
- [ ] Consistent typography hierarchy
- [ ] Hover states and transitions are smooth
- [ ] Loading states show spinners
- [ ] Error states show helpful messages
- [ ] Focus states are visible for accessibility
- [ ] Dark mode compatibility checked

## 🎯 Key Improvements by Category

### Visual Polish
- ✓ Consistent border radius (lg: 8px, xl: 12px, 2xl: 16px)
- ✓ Consistent shadows (sm/md/lg)
- ✓ Smooth transitions (duration-200)
- ✓ Proper color hierarchy
- ✓ Better spacing and alignment

### Components
- ✓ Modern button styles with gradients
- ✓ Card-based layouts
- ✓ Better form controls
- ✓ Status badges
- ✓ Alert messages
- ✓ Loading spinners

### Interactions
- ✓ Hover effects on interactive elements
- ✓ Focus states for accessibility
- ✓ Loading states with spinners
- ✓ Success/error feedback
- ✓ Smooth page transitions
- ✓ Micro-interactions

### Layouts
- ✓ PageLayout standardization
- ✓ Responsive grid layouts
- ✓ Consistent spacing
- ✓ Better navigation patterns
- ✓ Breadcrumb support
- ✓ Action button placement

## 📦 Dependencies

Ensure these are installed:
```bash
npm install class-variance-authority clsx tailwind-merge
```

## 🚀 Example Implementation

### Before (Old)
```tsx
export default function ProductsPage() {
  return (
    <div className="p-4">
      <h1>Products</h1>
      <button className="bg-blue-500 text-white px-4 py-2">Add Product</button>
      <div className="mt-4">
        {products.map(p => (
          <div key={p.id} className="border p-4 mb-2">
            {p.name}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### After (New)
```tsx
import { PageLayout, PageSection, Button, Card, CardContent } from '@/components/ui';

export default function ProductsPage() {
  return (
    <PageLayout
      title="Products"
      subtitle="Manage your product catalog"
      actions={<Button href="/products/new">Add Product</Button>}
    >
      <PageSection title="All Products">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(p => (
            <Card key={p.id} hover shadow="md">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg">{p.name}</h3>
                <p className="text-gray-600 mt-2">{p.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </PageSection>
    </PageLayout>
  );
}
```

---

**Next Steps:**
1. Install dependencies if not present
2. Start with Phase 1 (critical pages)
3. Test responsive design
4. Deploy and iterate based on feedback
