# Profile Interface Unification - Architecture Documentation

## Problem Statement
Previously had **inconsistent profile interfaces** across different pages:
- **Customer Account** (`/account/page.tsx`): Basic fields only (firstName, lastName, email, phone, profileImage)
- **Vendor Account** (`/vendor/account/page.tsx`): Fields + vendor fields (vendorType, vendorDescription, vendorLogo)
- Different implementations led to code duplication and maintenance issues

## Solution: Unified Profile System

### 1. **Unified Profile Interface** (`src/types/profile.ts`)
Defines consistent data structures used across all pages:

```typescript
// Single UserProfile interface for all roles
interface UserProfile {
  // Basic Info (All users)
  id, firstName, lastName, email, phone, profileImage, role
  
  // Vendor Info (VENDOR role only) - optional
  vendorType?, vendorDescription?, vendorLogo?, isFrozen?
  
  // Account Status
  isEmailVerified?, isPhoneVerified?, createdAt?, updatedAt?
}

// Payload sent to API
interface UpdateProfilePayload {
  firstName?, lastName?, email?, phone?, profileImage?
  vendorType?, vendorDescription?, vendorLogo? // vendor only
}

// Form state for all pages
interface ProfileFormState extends UpdateProfilePayload
```

### 2. **Unified Profile Management Hook** (`src/hooks/useProfileManagement.ts`)
Consolidates all profile management logic:

**Features:**
- Profile data initialization from any UserProfile
- Email change OTP verification flow
- Image upload handling (5MB limit, format validation)
- Profile save with validation
- Support for conditional vendor fields

**Usage:**
```typescript
const profileManager = useProfileManagement(profile, includeVendorFields: boolean);

// Access form state
profileManager.formData
profileManager.setFormData()

// Handle uploads
profileManager.uploadProfilePhoto(file)

// Handle email change
profileManager.sendEmailChangeOtp()
profileManager.verifyEmailChangeOtp()

// Save profile
profileManager.saveProfile(onBeforeSave?: () => boolean)
```

### 3. **Shared Data Contract**

**API Endpoint (Single for all):**
```
PUT /users/profile
```

**Request Payload (All optional fields):**
```json
{
  "firstName": "string",
  "lastName": "string", 
  "email": "string",
  "phone": "string",
  "profileImage": "string",
  "vendorType": "BEAUTY|PHARMACY|...", // vendor only
  "vendorDescription": "string",        // vendor only
  "vendorLogo": "string"               // vendor only
}
```

**Response:** Returns full updated UserProfile with all fields

### 4. **Backend Consistency**

**UpdateProfileDto** (`backend/src/modules/users/dto/users.dto.ts`):
- Contains all possible fields (basic + vendor)
- All fields are optional (@IsOptional)
- Backend validates vendor fields only apply to VENDOR role users
- Backward compatible with customer-only clients

**Users Controller & Service:**
- Single `updateProfile()` method handles all field types
- Updates `skinType` for customers (if provided)
- Updates `vendorType`, `vendorDescription`, `vendorLogo` for vendors (if provided)
- Email change requires OTP verification (same for all roles)

## Benefits

✅ **Single Source of Truth** - One interface for all profile data
✅ **No Code Duplication** - Reusable hook and types
✅ **Easier Maintenance** - Changes in one place apply everywhere
✅ **Consistent UX** - All pages follow same pattern
✅ **Role-based Fields** - Vendor fields only appear for VENDOR role
✅ **Type Safety** - TypeScript ensures proper field usage
✅ **Extensible** - Easy to add new roles or fields

## Migration Path for Pages

### Before (Inconsistent)
```typescript
// Each page had own form state, upload logic, OTP logic
const [formData, setFormData] = useState({...})
const uploadProfilePhoto = async (file) => {...}
const sendEmailChangeOtp = async () => {...}
```

### After (Unified)
```typescript
// Both pages use same hook from useProfileManagement
const {
  formData, setFormData,
  uploadProfilePhoto,
  sendEmailChangeOtp,
  saveProfile,
  ...
} = useProfileManagement(profile, includeVendorFields);
```

## Implementation Files

1. **`src/types/profile.ts`** - Unified interfaces and constants
2. **`src/hooks/useProfileManagement.ts`** - Shared profile management logic
3. **`src/app/account/page.tsx`** - Can be refactored to use hook
4. **`src/app/vendor/account/page.tsx`** - Already uses consistent API, can use hook
5. **`backend/src/modules/users/dto/users.dto.ts`** - Single DTO for all profile updates

## Future Improvements

- Create reusable `ProfileForm` component for form UI
- Create `ProfileImageUpload` component for image handling
- Create `EmailChangeForm` component for OTP verification
- Standardize all admin/editor account settings pages to use same pattern
