# Settings.jsx - Forms Analysis

## Overview
The `Settings.jsx` component manages **three different types of user forms**:
1. **Receptionist Form** - Simple inline form
2. **Doctor Form** - External component with Formik validation
3. **Patient Form** - Multi-step form with context-based state management

---

## 1. RECEPTIONIST FORM

### Form Type
- **Simple inline form** (rendered directly in Settings.jsx)
- Single-step form with basic fields
- No external component dependencies

### State Management
```javascript
const [formData, setFormData] = useState({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  signupMethod: "email",
});
const [showAddModal, setShowAddModal] = useState(false);
```

### CREATE Flow
1. **Trigger**: Click "Dodaj Recepcjonistę" from dropdown (line 722-730)
2. **Open Modal**: `setShowAddModal(true)` (line 726)
3. **User Input**: Form fields update via `handleInputChange` (line 367-373)
4. **Submit**: `handleAddReceptionist` called (line 375-411)
   - Calls `adminHelper.addReceptionist(formData)`
   - Shows loader
   - On success: closes modal, resets form, refreshes user list
   - On error: shows toast + error message

### EDIT Flow
- **NOT SUPPORTED** - Receptionist form only supports CREATE operations
- No edit functionality exists in the codebase

### Key Functions
- `handleInputChange` (line 367-373): Updates form state
- `handleAddReceptionist` (line 375-411): Submits form data

### Modal Location
- Lines 1099-1196: Inline modal component

---

## 2. DOCTOR FORM

### Form Type
- **External component**: `AddDoctorForm` from `../Doctor/CreateDoctor`
- Uses **Formik** for form management and validation
- Uses **Yup** for schema validation
- Supports image cropping functionality

### State Management
```javascript
const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
const [selectedDoctor, setSelectedDoctor] = useState(null); // null = create, object = edit
```

### CREATE Flow
1. **Trigger**: Click "Dodaj Specjalistę" from dropdown (line 713-721)
2. **Open Modal**: `setShowAddDoctorModal(true)` (line 717)
3. **Form State**: `selectedDoctor` remains `null`
4. **User Input**: Handled by Formik inside `AddDoctorForm` component
5. **Submit**: `handleAddDoctor` called (line 414-454)
   - Checks if `selectedDoctor` exists
   - If null: calls `doctorService.createDoctor(doctorData)`
   - Shows loader
   - On success: refreshes user list, closes modal, resets form
   - On error: shows toast + error message

### EDIT Flow
1. **Trigger**: Click "Edytuj" button for doctor in table (line 994-999)
2. **Load Data**: `handleEditDoctor` called (line 669-681)
   - Calls `doctorService.getDoctorDetailsById(userId)`
   - Sets `selectedDoctor` with doctor data
   - Opens modal: `setShowAddDoctorModal(true)`
3. **Form Pre-population**: `AddDoctorForm` receives `initialData={selectedDoctor}` and `isEditMode={!!selectedDoctor}`
4. **User Modifications**: Handled by Formik
5. **Submit**: `handleAddDoctor` called (line 414-454)
   - Checks if `selectedDoctor` exists
   - If exists: calls `doctorService.updateDoctor(selectedDoctor.id, doctorData)`
   - Shows loader
   - On success: refreshes user list, closes modal, clears `selectedDoctor`
   - On error: shows toast + error message

### Key Functions
- `handleAddDoctor` (line 414-454): Handles both create and update
- `handleEditDoctor` (line 669-681): Loads doctor data for editing

### Modal Location
- Lines 1198-1215: Uses external `AddDoctorForm` component

### Special Features
- Image cropping support
- Specialization dropdown with multi-select
- Qualifications array management
- Profile picture preview in edit mode

---

## 3. PATIENT FORM

### Form Type
- **Multi-step form** with 6 steps
- Uses **FormProvider** context for state management
- External component: `PatientStepForm` from `../SubComponentForm/PatientStepForm`
- Wrapper component: `PatientStepFormWrapper` (defined in Settings.jsx)

### Steps (subStepTitles)
1. **Dane Podstawowe** (Demographics) - Step 0
2. **Skierowanie** (Referrer) - Step 1
3. **Adres** (Address) - Step 2
4. **Zgody** (Consents) - Step 3
5. **Szczegóły** (Details) - Step 4
6. **Notatki** (Notes) - Step 5

### State Management
```javascript
const [showAddPatientModal, setShowAddPatientModal] = useState(false);
const [isEditMode, setIsEditMode] = useState(false);
const [currentPatientId, setCurrentPatientId] = useState(null);
const [currentSubStep, setCurrentSubStep] = useState(0);
const [patientFormData, setPatientFormData] = useState({});
const [selectedPhoneCode, setSelectedPhoneCode] = useState("+48");
const [returnUrl, setReturnUrl] = useState(null); // For navigation after save
```

### CREATE Flow
1. **Trigger**: 
   - Click "Dodaj Pacjenta" from dropdown (line 733-741)
   - OR via URL parameter `?edytujPacjenta=ID` (line 228-243)
2. **Open Modal**: `setShowAddPatientModal(true)` (line 737)
3. **Initialize Form**:
   - `isEditMode = false`
   - `currentSubStep = 0` (starts at first step)
   - `patientFormData = {}` (empty or with draft data)
   - `FormProvider` wraps form with `initialData={patientFormData}`
4. **Step Navigation**:
   - User fills step 0 → clicks "Next" → `goToSubStep(1)` (line 617-619)
   - `markStepAsCompleted` called (line 621-634)
   - Continues through steps 0-4
5. **Final Step**:
   - On step 5 (last step), `markStepAsCompleted` calls `handleAddPatient` (line 630)
6. **Submit**: `handleAddPatient` called (line 560-614)
   - Checks `isEditMode` (false for create)
   - Calls `patientService.createPatient(patientData)`
   - Shows loader
   - On success: closes modal, resets form, refreshes user list
   - On error: shows toast + error message

### EDIT Flow
1. **Trigger**: 
   - Click "Edytuj" button for patient in table (line 1002-1009)
   - OR via URL parameter `?edytujPacjenta=ID&returnUrl=...` (line 228-243)
2. **Load Data**: `handleEditPatient` called (line 457-557)
   - Calls `patientService.getPatientById(userId)`
   - Maps patient data to form structure (line 463-522)
   - Extracts phone code from phone number (line 524-545)
   - Sets `patientFormData` with mapped data
   - Sets `currentPatientId = userId`
   - Sets `isEditMode = true`
   - Opens modal: `setShowAddPatientModal(true)`
3. **Form Pre-population**:
   - `FormProvider` receives `initialData={patientFormData}` (line 1265)
   - `PatientStepFormWrapper` detects edit mode (line 1406-1411)
   - Calls `updateMultipleFields(patientFormData)` to populate all fields
   - Sets all steps as completed: `setCompletedSteps([0,1,2,3,4,5])`
   - User can navigate to any step
4. **Step Navigation**:
   - User can jump to any step (all marked as completed)
   - Modifications tracked in FormContext
5. **Submit**: `handleAddPatient` called (line 560-614)
   - Checks `isEditMode` (true) and `currentPatientId`
   - Calls `patientService.updatePatient(currentPatientId, patientData)`
   - Shows loader
   - On success: closes modal, resets edit state, refreshes user list
   - If `returnUrl` exists: navigates back to original page
   - On error: shows toast + error message

### URL Parameter Support
- **Edit via URL**: `?edytujPacjenta=USER_ID&returnUrl=ENCODED_URL`
- Handled in `useEffect` (line 228-243)
- Automatically calls `handleEditPatient` when parameter detected
- Stores `returnUrl` for navigation after save
- Clears URL parameters after handling

### Key Functions
- `handleAddPatient` (line 560-614): Handles both create and update
- `handleEditPatient` (line 457-557): Loads and maps patient data for editing
- `goToSubStep` (line 617-619): Navigates between form steps
- `markStepAsCompleted` (line 621-634): Handles step completion and final submission
- `handlePhoneCodeChange` (line 173-182): Updates phone country code
- `handlePhoneNumberChange` (line 185-198): Validates and updates phone number
- `handleRemoveEmail` (line 113-152): Removes patient email (edit mode only)

### Modal Location
- Lines 1217-1288: Modal with FormProvider wrapper

### Form Context Integration
- **FormProvider** (line 1263-1284): Provides form state to all sub-steps
- **PatientStepFormWrapper** (line 1359-1472): 
  - Connects FormContext to parent component
  - Handles draft recovery
  - Exposes `updateFormData` globally for auto-save
  - Manages initialization in edit mode

### Special Features
- **Phone Validation**: Country code + number validation (line 158-170)
- **Draft Recovery**: Supports auto-save and draft recovery (line 1397-1423)
- **Email Removal**: Can remove patient email in edit mode (line 113-152)
- **Return URL**: Navigates back to original page after save (line 597-600)
- **Multi-step Navigation**: Users can jump between completed steps

---

## COMPARISON TABLE

| Feature | Receptionist | Doctor | Patient |
|---------|------------|--------|---------|
| **Form Type** | Inline | External (Formik) | External (Multi-step) |
| **Validation** | HTML5 | Yup Schema | Context-based |
| **State Management** | useState | Formik | FormProvider Context |
| **Edit Support** | ❌ No | ✅ Yes | ✅ Yes |
| **Steps** | 1 | 1 | 6 |
| **Modal** | Inline | External Component | Inline with External Form |
| **Image Upload** | ❌ No | ✅ Yes (with crop) | ✅ Yes |
| **Phone Validation** | ❌ No | ✅ Basic | ✅ Advanced (country codes) |
| **URL Parameters** | ❌ No | ❌ No | ✅ Yes |
| **Draft Recovery** | ❌ No | ❌ No | ✅ Yes |

---

## COMMON PATTERNS

### Modal Management
All forms follow similar modal patterns:
- State: `show[Form]Modal` boolean
- Open: Set state to `true`
- Close: Set state to `false` + reset related state

### Success/Error Handling
- All forms use `toast` from `sonner` for notifications
- All forms use `showLoader`/`hideLoader` for loading states
- All forms refresh user list after successful create/update

### Edit Mode Detection
- **Doctor**: `selectedDoctor !== null`
- **Patient**: `isEditMode === true && currentPatientId !== null`

### Form Reset
- **Receptionist**: Manual reset of `formData` object
- **Doctor**: Formik's `resetForm()` function
- **Patient**: Reset via `FormProvider` key change + state reset

---

## NOTES

1. **Receptionist form has no edit functionality** - only create
2. **Patient form supports URL-based editing** for deep linking
3. **Patient form has the most complex state management** with context and multi-step navigation
4. **All forms refresh the user list** after successful operations
5. **Phone validation is only implemented for Patient form**
6. **Draft recovery is only available for Patient form**

