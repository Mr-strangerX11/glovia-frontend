# 🎯 UI Improvements Quick Reference Card

## Component Imports
```tsx
import { 
  Button, 
  Card, CardHeader, CardTitle, CardContent, CardFooter,
  Input, TextArea, Select,
  Badge, Alert,
  PageLayout, PageSection, PageGrid
} from '@/components/ui';
```

---

## Button Component

### Variants
`primary` | `secondary` | `outline` | `ghost` | `danger` | `success`

### Sizes
`xs` | `sm` | `md` (default) | `lg` | `xl`

### Usage Examples
```tsx
// Primary button
<Button variant="primary">Click me</Button>

// Full width
<Button fullWidth>Sign up</Button>

// With icon
<Button className="gap-2">
  <ShoppingCart className="h-4 w-4" />
  Add to Cart
</Button>

// Loading state
<Button isLoading>Processing...</Button>

// Disabled
<Button disabled>Disabled</Button>
```

---

## Card Component

### Usage
```tsx
<Card shadow="sm" hover>
  <CardHeader>
    <CardTitle>Welcome</CardTitle>
  </CardHeader>
  <CardContent>
    Your content here
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Shadows
`shadow="none"` | `shadow="sm"` | `shadow="md"` | `shadow="lg"`

### Props
- `shadow` - Shadow depth
- `hover` - Add lift effect on hover

---

## Form Components

### Input
```tsx
<Input 
  label="Email"
  type="email"
  placeholder="you@example.com"
  required
  error={emailError}
  helperText="We'll never spam"
/>
```

### TextArea
```tsx
<TextArea
  label="Message"
  placeholder="Tell us..."
  helperText="Max 500 chars"
  error={messageError}
/>
```

### Select
```tsx
<Select
  label="Category"
  options={[
    { value: '1', label: 'Beauty' },
    { value: '2', label: 'Medicine' }
  ]}
  error={categoryError}
/>
```

---

## Badge Component

### Variants
`primary` | `secondary` | `success` | `warning` | `danger` | `info`

### Sizes
`sm` | `md` (default) | `lg`

### Usage
```tsx
// Status badge
<Badge variant="success">Active</Badge>

// With icon
<Badge variant="danger" icon={<X className="h-3 w-3" />}>
  Rejected
</Badge>

// Small badge
<Badge variant="warning" size="sm">
  Pending
</Badge>
```

---

## Alert Component

### Variants
`success` | `error` | `warning` | `info`

### Usage
```tsx
// Simple alert
<Alert variant="success" title="Done!" />

// With description
<Alert 
  variant="error"
  title="Error"
  description="Something went wrong"
/>

// Dismissible
<Alert 
  variant="warning"
  title="Warning"
  dismissible
  onDismiss={() => console.log('dismissed')}
/>
```

---

## PageLayout Component

### Basic Usage
```tsx
<PageLayout
  title="Products"
  subtitle="Manage your products"
>
  {children}
</PageLayout>
```

### With Breadcrumbs
```tsx
<PageLayout
  title="Edit Product"
  breadcrumbs={[
    { label: 'Admin', href: '/admin' },
    { label: 'Products', href: '/admin/products' },
    { label: 'Edit' }
  ]}
>
  {children}
</PageLayout>
```

### With Actions
```tsx
<PageLayout
  title="Orders"
  actions={
    <div className="flex gap-2">
      <Button variant="outline">Export</Button>
      <Button>Add Order</Button>
    </div>
  }
>
  {children}
</PageLayout>
```

---

## PageSection Component

### Usage
```tsx
<PageSection title="Featured Products">
  {children}
</PageSection>

<PageSection 
  title="All Orders"
  subtitle="View all customer orders"
>
  {children}
</PageSection>
```

---

## PageGrid Component

### Responsive Grids
```tsx
// 3 columns on desktop
<PageGrid cols={3} gap="gap-6">
  {items.map(item => <Card key={item.id}>{item}</Card>)}
</PageGrid>

// Default is responsive: 1 col mobile, 2 tablet, 3 desktop
<PageGrid>
  {items}
</PageGrid>
```

---

## Common Patterns

### Search Input
```tsx
<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
  <Input
    placeholder="Search..."
    className="pl-10"
    value={query}
    onChange={(e) => setQuery(e.target.value)}
  />
</div>
```

### Filter Tabs
```tsx
<div className="flex gap-2">
  {filters.map(f => (
    <button
      key={f}
      onClick={() => setFilter(f)}
      className={`px-4 py-2 rounded-lg transition-all ${
        filter === f
          ? 'bg-primary-600 text-white'
          : 'border border-gray-200 text-gray-700'
      }`}
    >
      {f}
    </button>
  ))}
</div>
```

### Product Card
```tsx
<Card hover shadow="md" className="overflow-hidden">
  <Image
    src={product.image}
    alt={product.name}
    width={300}
    height={300}
    className="w-full aspect-square object-cover"
  />
  <CardContent className="p-4">
    <h3 className="font-semibold">{product.name}</h3>
    <p className="text-primary-600 font-bold mt-2">
      NPR {product.price}
    </p>
  </CardContent>
  <CardFooter>
    <Button fullWidth>Add to Cart</Button>
  </CardFooter>
</Card>
```

### Table with Actions
```tsx
<Card>
  <table className="w-full">
    <thead>
      <tr className="border-b bg-gray-50">
        <th className="px-6 py-4 text-left font-semibold">Name</th>
        <th className="px-6 py-4 text-left font-semibold">Status</th>
        <th className="px-6 py-4 text-left font-semibold">Actions</th>
      </tr>
    </thead>
    <tbody>
      {items.map(item => (
        <tr key={item.id} className="border-b hover:bg-gray-50">
          <td className="px-6 py-4">{item.name}</td>
          <td className="px-6 py-4">
            <Badge variant="success">{item.status}</Badge>
          </td>
          <td className="px-6 py-4 flex gap-2">
            <Button size="sm" variant="outline">Edit</Button>
            <Button size="sm" variant="danger">Delete</Button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</Card>
```

---

## Responsive Classes

### Mobile First
```tsx
// Mobile default, tablet and up
<div className="text-sm md:text-base lg:text-lg">
  Responsive text
</div>

// Grid responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items}
</div>

// Hide/show
<div className="hidden md:block">
  Desktop only
</div>

<div className="md:hidden">
  Mobile only
</div>
```

---

## Spacing Utilities

```tsx
// Padding
<div className="p-4">Padded</div>       // All sides
<div className="px-4 py-2">Padded</div>  // Horizontal and vertical

// Margin
<div className="m-4">Margin</div>
<div className="mt-4 mb-2">Custom margin</div>

// Gap (flexbox/grid)
<div className="flex gap-3">Items with space</div>
<div className="grid gap-6">Grid with gaps</div>
```

---

## Colors

### Text
- Heading: `text-gray-900`
- Body: `text-gray-700`
- Helper: `text-gray-600`
- Muted: `text-gray-500`
- Error: `text-red-600`
- Success: `text-emerald-600`

### Backgrounds
- Primary: `bg-primary-50`, `bg-primary-100`, `bg-primary-600`
- Success: `bg-emerald-50`, `bg-emerald-600`
- Warning: `bg-amber-50`, `bg-amber-600`
- Danger: `bg-red-50`, `bg-red-600`

### Borders
- Default: `border border-gray-200`
- Focus: `focus:border-primary-500`

---

## Icons (from lucide-react)

```tsx
import {
  Search, Filter, ChevronRight, ChevronLeft,
  Heart, ShoppingCart, Star, Trash2, Edit2,
  Download, Upload, Plus, X, Check,
  AlertCircle, CheckCircle, AlertTriangle,
  Loader2, Eye, Home, Settings
} from 'lucide-react';

<Button className="gap-2">
  <ShoppingCart className="h-4 w-4" />
  Add to Cart
</Button>
```

---

## States Management Pattern

```tsx
// Loading state
const [isLoading, setIsLoading] = useState(false);

// Error state
const [error, setError] = useState('');

// Success state
const [success, setSuccess] = useState(false);

// Usage
const handleSubmit = async () => {
  setIsLoading(true);
  setError('');
  try {
    await api.call();
    setSuccess(true);
  } catch (err) {
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
};

// Render
{error && <Alert variant="error" title="Error" description={error} />}
{success && <Alert variant="success" title="Success" />}
<Button isLoading={isLoading} onClick={handleSubmit}>
  Save
</Button>
```

---

## Dark Mode (If Needed)

Add `dark:` prefix to any Tailwind class:
```tsx
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  Adapts to dark mode
</div>
```

---

## Testing Checklist

- [ ] Component renders without errors
- [ ] All props work
- [ ] Responsive on mobile/tablet/desktop
- [ ] Hover states visible
- [ ] Focus states visible
- [ ] Disabled state works
- [ ] Loading state works
- [ ] Error states display
- [ ] Smooth transitions
- [ ] Accessibility (keyboard nav)

---

## Quick Tips

1. **Always use PageLayout** for pages
2. **Use semantic HTML** (`<button>`, `<input>`)
3. **Add gap-2 to button groups** for spacing
4. **Use fullWidth on forms** for better mobile
5. **Add hover:shadow-lg to interactive elements**
6. **Test on mobile first**, then enhance
7. **Use consistent spacing** (gap-4, gap-6, gap-8)
8. **Add loading states** to async operations
9. **Show error messages** clearly
10. **Celebrate small wins** 🎉

---

**Keep this handy while implementing! 📌**
