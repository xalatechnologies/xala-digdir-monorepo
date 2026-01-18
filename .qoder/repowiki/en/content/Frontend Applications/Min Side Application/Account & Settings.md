# Account & Settings

<cite>
**Referenced Files in This Document**
- [apps/minside/src/routes/settings.tsx](file://apps/minside/src/routes/settings.tsx)
- [apps/minside/src/features/settings/types.ts](file://apps/minside/src/features/settings/types.ts)
- [apps/minside/src/features/settings/components/ProfileTab.tsx](file://apps/minside/src/features/settings/components/ProfileTab.tsx)
- [apps/minside/src/features/settings/components/NotificationsTab.tsx](file://apps/minside/src/features/settings/components/NotificationsTab.tsx)
- [apps/minside/src/features/settings/components/PrivacyTab.tsx](file://apps/minside/src/features/settings/components/PrivacyTab.tsx)
- [apps/minside/src/features/settings/components/PreferencesTab.tsx](file://apps/minside/src/features/settings/components/PreferencesTab.tsx)
- [apps/minside/src/features/settings/hooks/useNotificationSettings.ts](file://apps/minside/src/features/settings/hooks/useNotificationSettings.ts)
- [apps/minside/src/components/AccountSwitcher.tsx](file://apps/minside/src/components/AccountSwitcher.tsx)
- [apps/minside/src/providers/AccountContextProvider.tsx](file://apps/minside/src/providers/AccountContextProvider.tsx)
- [packages/client-sdk/src/services/gdpr.service.ts](file://packages/client-sdk/src/services/gdpr.service.ts)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)

## Introduction
This document describes the account settings and preferences system implemented in the MinSide application. It covers user profile management, personal information editing, notification preferences, privacy controls, language selection, and account switching across personal and organizational contexts. It also explains integration with backend services for GDPR data export and consent management, along with local persistence and UX behaviors.

## Project Structure
The settings system is primarily implemented in the MinSide application under the routes and features folders. Components are organized by functional areas (Profile, Notifications, Privacy, Preferences) and supported by shared types and hooks. Account switching spans a dedicated component and a context provider that manages multi-tenant and organization membership state.

```mermaid
graph TB
subgraph "MinSide App"
Routes["routes/settings.tsx"]
ProfileTab["features/settings/components/ProfileTab.tsx"]
NotificationsTab["features/settings/components/NotificationsTab.tsx"]
PrivacyTab["features/settings/components/PrivacyTab.tsx"]
PreferencesTab["features/settings/components/PreferencesTab.tsx"]
AccountSwitcher["components/AccountSwitcher.tsx"]
AccountContext["providers/AccountContextProvider.tsx"]
Types["features/settings/types.ts"]
NotifHook["features/settings/hooks/useNotificationSettings.ts"]
end
subgraph "Client SDK"
GdprSvc["packages/client-sdk/src/services/gdpr.service.ts"]
end
Routes --> ProfileTab
Routes --> NotificationsTab
Routes --> PrivacyTab
Routes --> PreferencesTab
Routes --> AccountSwitcher
AccountSwitcher --> AccountContext
ProfileTab --> GdprSvc
PrivacyTab --> GdprSvc
PreferencesTab --> GdprSvc
NotificationsTab --> NotifHook
NotifHook --> GdprSvc
Routes --> Types
```

**Diagram sources**
- [apps/minside/src/routes/settings.tsx](file://apps/minside/src/routes/settings.tsx#L46-L977)
- [apps/minside/src/features/settings/components/ProfileTab.tsx](file://apps/minside/src/features/settings/components/ProfileTab.tsx#L38-L267)
- [apps/minside/src/features/settings/components/NotificationsTab.tsx](file://apps/minside/src/features/settings/components/NotificationsTab.tsx#L19-L131)
- [apps/minside/src/features/settings/components/PrivacyTab.tsx](file://apps/minside/src/features/settings/components/PrivacyTab.tsx#L34-L264)
- [apps/minside/src/features/settings/components/PreferencesTab.tsx](file://apps/minside/src/features/settings/components/PreferencesTab.tsx#L18-L107)
- [apps/minside/src/components/AccountSwitcher.tsx](file://apps/minside/src/components/AccountSwitcher.tsx#L71-L415)
- [apps/minside/src/providers/AccountContextProvider.tsx](file://apps/minside/src/providers/AccountContextProvider.tsx#L83-L334)
- [apps/minside/src/features/settings/types.ts](file://apps/minside/src/features/settings/types.ts#L11-L168)
- [apps/minside/src/features/settings/hooks/useNotificationSettings.ts](file://apps/minside/src/features/settings/hooks/useNotificationSettings.ts#L26-L179)
- [packages/client-sdk/src/services/gdpr.service.ts](file://packages/client-sdk/src/services/gdpr.service.ts#L17-L88)

**Section sources**
- [apps/minside/src/routes/settings.tsx](file://apps/minside/src/routes/settings.tsx#L46-L977)
- [apps/minside/src/features/settings/types.ts](file://apps/minside/src/features/settings/types.ts#L11-L168)

## Core Components
- Settings page with tabbed navigation for Profile, Addresses, Privacy, Notifications, and Preferences.
- Profile tab for avatar upload and personal information editing.
- Notifications tab for channel toggles and automatic reminders.
- Privacy tab for data export, consent management, and account deletion.
- Preferences tab for language selection and session/logout actions.
- AccountSwitcher component and AccountContextProvider for multi-tenant and organization membership handling.
- useNotificationSettings hook for tenant-level notification preferences.
- GDPR service integration for data export, consent retrieval/update, and administrative request management.

**Section sources**
- [apps/minside/src/routes/settings.tsx](file://apps/minside/src/routes/settings.tsx#L288-L977)
- [apps/minside/src/features/settings/components/ProfileTab.tsx](file://apps/minside/src/features/settings/components/ProfileTab.tsx#L38-L267)
- [apps/minside/src/features/settings/components/NotificationsTab.tsx](file://apps/minside/src/features/settings/components/NotificationsTab.tsx#L19-L131)
- [apps/minside/src/features/settings/components/PrivacyTab.tsx](file://apps/minside/src/features/settings/components/PrivacyTab.tsx#L34-L264)
- [apps/minside/src/features/settings/components/PreferencesTab.tsx](file://apps/minside/src/features/settings/components/PreferencesTab.tsx#L18-L107)
- [apps/minside/src/components/AccountSwitcher.tsx](file://apps/minside/src/components/AccountSwitcher.tsx#L71-L415)
- [apps/minside/src/providers/AccountContextProvider.tsx](file://apps/minside/src/providers/AccountContextProvider.tsx#L83-L334)
- [apps/minside/src/features/settings/hooks/useNotificationSettings.ts](file://apps/minside/src/features/settings/hooks/useNotificationSettings.ts#L26-L179)
- [packages/client-sdk/src/services/gdpr.service.ts](file://packages/client-sdk/src/services/gdpr.service.ts#L17-L88)

## Architecture Overview
The settings system follows a layered pattern:
- UI layer: Tabbed settings page and dedicated components for each section.
- State and logic: Hooks encapsulate tenant and user-specific settings operations.
- Persistence and integration: Local storage for account context and SDK services for backend operations.
- Backend services: GDPR service handles data export, consent retrieval, and consent updates.

```mermaid
sequenceDiagram
participant U as "User"
participant SP as "SettingsPage"
participant PT as "ProfileTab"
participant NT as "NotificationsTab"
participant PR as "PrivacyTab"
participant PF as "PreferencesTab"
participant AC as "AccountSwitcher"
participant CP as "AccountContextProvider"
participant SDK as "Client SDK"
participant API as "Backend API"
U->>SP : Open Settings
SP->>PT : Render Profile tab
SP->>NT : Render Notifications tab
SP->>PR : Render Privacy tab
SP->>PF : Render Preferences tab
SP->>AC : Render AccountSwitcher
AC->>CP : switchToPersonal()/switchToOrganization()
CP-->>AC : Update active account
U->>PT : Edit profile and upload avatar
PT->>SDK : useUploadUserAvatar()
SDK->>API : POST /users/{id}/avatar
API-->>SDK : Avatar URL
SDK-->>PT : Success
U->>PR : Export data / Update consent / Delete account
PR->>SDK : gdprService.exportData() / updateConsents()
SDK->>API : GET /api/gdpr/export, PUT /api/gdpr/consents
API-->>SDK : Export payload / Updated consent
SDK-->>PR : Success
U->>NT : Toggle channels and save
NT->>SDK : useUpdateTenantSettings()
SDK->>API : PUT /tenant/settings
API-->>SDK : Updated settings
SDK-->>NT : Success
```

**Diagram sources**
- [apps/minside/src/routes/settings.tsx](file://apps/minside/src/routes/settings.tsx#L46-L977)
- [apps/minside/src/features/settings/components/ProfileTab.tsx](file://apps/minside/src/features/settings/components/ProfileTab.tsx#L91-L122)
- [apps/minside/src/features/settings/components/PrivacyTab.tsx](file://apps/minside/src/features/settings/components/PrivacyTab.tsx#L65-L103)
- [apps/minside/src/features/settings/components/NotificationsTab.tsx](file://apps/minside/src/features/settings/components/NotificationsTab.tsx#L19-L131)
- [apps/minside/src/features/settings/hooks/useNotificationSettings.ts](file://apps/minside/src/features/settings/hooks/useNotificationSettings.ts#L90-L113)
- [apps/minside/src/components/AccountSwitcher.tsx](file://apps/minside/src/components/AccountSwitcher.tsx#L102-L116)
- [apps/minside/src/providers/AccountContextProvider.tsx](file://apps/minside/src/providers/AccountContextProvider.tsx#L232-L252)
- [packages/client-sdk/src/services/gdpr.service.ts](file://packages/client-sdk/src/services/gdpr.service.ts#L67-L83)

## Detailed Component Analysis

### Settings Page and Tabs
- The SettingsPage renders a tabbed interface with Profile, Addresses, Privacy, Notifications, and Preferences.
- It orchestrates loading user data, managing save states, and coordinating cross-tab actions like scroll indicators and success feedback.
- Each tab encapsulates its own concerns: profile editing, address management, privacy controls, notification configuration, and preferences.

```mermaid
flowchart TD
Start(["Open Settings"]) --> LoadUser["Load current user data"]
LoadUser --> RenderTabs["Render tabs: Profile | Addresses | Privacy | Notifications | Preferences"]
RenderTabs --> InteractProfile["Edit profile and avatar"]
RenderTabs --> InteractPrivacy["Export data / Update consent / Delete account"]
RenderTabs --> InteractNotifications["Configure channels and reminders"]
RenderTabs --> InteractPreferences["Change language / Logout"]
InteractProfile --> SaveProfile["Save profile"]
InteractPrivacy --> ExportData["Export data"]
InteractPrivacy --> UpdateConsents["Update consents"]
InteractNotifications --> SaveNotifications["Save tenant settings"]
InteractPreferences --> ChangeLang["Change locale"]
SaveProfile --> Feedback["Show success"]
ExportData --> Feedback
UpdateConsents --> Feedback
SaveNotifications --> Feedback
ChangeLang --> Feedback
Feedback --> End(["Done"])
```

**Diagram sources**
- [apps/minside/src/routes/settings.tsx](file://apps/minside/src/routes/settings.tsx#L46-L977)

**Section sources**
- [apps/minside/src/routes/settings.tsx](file://apps/minside/src/routes/settings.tsx#L288-L977)

### Profile Management
- Loads current user data into the form and supports avatar preview and upload.
- Provides save action for profile updates and address copy functionality.
- Integrates with SDK hooks for updating user info and uploading avatar.

```mermaid
sequenceDiagram
participant U as "User"
participant PT as "ProfileTab"
participant SDK as "Client SDK"
participant API as "Backend API"
U->>PT : Change avatar
PT->>SDK : useUploadUserAvatar({id,file,options})
SDK->>API : POST /users/{id}/avatar
API-->>SDK : {avatarUrl}
SDK-->>PT : Success
U->>PT : Save profile
PT->>SDK : useUpdateCurrentUser(profileData)
SDK->>API : PUT /users/{id}
API-->>SDK : {user}
SDK-->>PT : Success
```

**Diagram sources**
- [apps/minside/src/features/settings/components/ProfileTab.tsx](file://apps/minside/src/features/settings/components/ProfileTab.tsx#L91-L122)
- [apps/minside/src/routes/settings.tsx](file://apps/minside/src/routes/settings.tsx#L132-L170)

**Section sources**
- [apps/minside/src/features/settings/components/ProfileTab.tsx](file://apps/minside/src/features/settings/components/ProfileTab.tsx#L38-L267)
- [apps/minside/src/routes/settings.tsx](file://apps/minside/src/routes/settings.tsx#L132-L170)

### Notification Preferences
- Uses a dedicated hook to load and persist tenant-level notification settings.
- Supports enabling/disabling channels and configuring automatic reminders with validation.
- Persists changes via tenant settings mutation.

```mermaid
flowchart TD
Load["Load tenant settings"] --> Form["Render notification form"]
Form --> Toggle["Toggle channels"]
Form --> Reminder["Adjust reminder hours"]
Toggle --> Validate["Validate reminder hours >= 1"]
Reminder --> Validate
Validate --> Save["Save tenant settings"]
Save --> Success["Show success"]
```

**Diagram sources**
- [apps/minside/src/features/settings/hooks/useNotificationSettings.ts](file://apps/minside/src/features/settings/hooks/useNotificationSettings.ts#L26-L179)
- [apps/minside/src/features/settings/components/NotificationsTab.tsx](file://apps/minside/src/features/settings/components/NotificationsTab.tsx#L19-L131)

**Section sources**
- [apps/minside/src/features/settings/hooks/useNotificationSettings.ts](file://apps/minside/src/features/settings/hooks/useNotificationSettings.ts#L26-L179)
- [apps/minside/src/features/settings/components/NotificationsTab.tsx](file://apps/minside/src/features/settings/components/NotificationsTab.tsx#L19-L131)

### Privacy Settings and GDPR Compliance
- Provides data export, consent management, and account deletion flows.
- Integrates with GDPR service for exporting user data and updating consent preferences.
- Includes confirmation dialogs and success feedback.

```mermaid
sequenceDiagram
participant U as "User"
participant PR as "PrivacyTab"
participant SDK as "Client SDK"
participant API as "Backend API"
U->>PR : Click Export Data
PR->>SDK : gdprService.exportData()
SDK->>API : GET /api/gdpr/export
API-->>SDK : {data}
SDK-->>PR : Blob download
U->>PR : Toggle consent
PR->>SDK : gdprService.updateConsents({marketing,analytics,thirdPartySharing})
SDK->>API : PUT /api/gdpr/consents
API-->>SDK : {consents}
SDK-->>PR : Success
U->>PR : Delete account
PR->>SDK : Delete account mutation
SDK->>API : DELETE /users/me
API-->>SDK : Success
SDK-->>PR : Redirect and logout
```

**Diagram sources**
- [apps/minside/src/features/settings/components/PrivacyTab.tsx](file://apps/minside/src/features/settings/components/PrivacyTab.tsx#L65-L103)
- [packages/client-sdk/src/services/gdpr.service.ts](file://packages/client-sdk/src/services/gdpr.service.ts#L67-L83)

**Section sources**
- [apps/minside/src/features/settings/components/PrivacyTab.tsx](file://apps/minside/src/features/settings/components/PrivacyTab.tsx#L34-L264)
- [packages/client-sdk/src/services/gdpr.service.ts](file://packages/client-sdk/src/services/gdpr.service.ts#L17-L88)

### Preferences and Language Selection
- Allows changing the application language via locale provider.
- Provides a logout action for the current session.
- Notes on future theme customization availability.

```mermaid
flowchart TD
Pref["Open Preferences"] --> Lang["Select language"]
Lang --> Apply["Apply locale change"]
Apply --> Logout["Logout current session"]
Logout --> Done["Done"]
```

**Diagram sources**
- [apps/minside/src/features/settings/components/PreferencesTab.tsx](file://apps/minside/src/features/settings/components/PreferencesTab.tsx#L18-L107)

**Section sources**
- [apps/minside/src/features/settings/components/PreferencesTab.tsx](file://apps/minside/src/features/settings/components/PreferencesTab.tsx#L18-L107)

### Account Switching and Multi-Tenant Context
- The AccountSwitcher displays personal and organization accounts and allows switching between them.
- The AccountContextProvider manages account type, selected organization, persistence in local storage, and validation of organization membership.
- On switch, navigates to appropriate dashboards and persists choices.

```mermaid
sequenceDiagram
participant U as "User"
participant AS as "AccountSwitcher"
participant CP as "AccountContextProvider"
participant NAV as "Router"
U->>AS : Click switcher
AS->>CP : switchToPersonal() or switchToOrganization(orgId)
CP->>CP : Persist in localStorage
CP-->>AS : Update active account
AS->>NAV : navigate("/", "/org")
NAV-->>AS : Route updated
```

**Diagram sources**
- [apps/minside/src/components/AccountSwitcher.tsx](file://apps/minside/src/components/AccountSwitcher.tsx#L102-L116)
- [apps/minside/src/providers/AccountContextProvider.tsx](file://apps/minside/src/providers/AccountContextProvider.tsx#L232-L252)

**Section sources**
- [apps/minside/src/components/AccountSwitcher.tsx](file://apps/minside/src/components/AccountSwitcher.tsx#L71-L415)
- [apps/minside/src/providers/AccountContextProvider.tsx](file://apps/minside/src/providers/AccountContextProvider.tsx#L83-L334)

## Dependency Analysis
- Settings components depend on shared types for settings sections and DTOs.
- Notification preferences rely on a dedicated hook and tenant settings mutations.
- Privacy features integrate with the GDPR service for data export and consent management.
- Account switching depends on the AccountContextProvider for state and persistence.

```mermaid
graph LR
Types["features/settings/types.ts"] --> SettingsPage["routes/settings.tsx"]
SettingsPage --> ProfileTab["ProfileTab.tsx"]
SettingsPage --> NotificationsTab["NotificationsTab.tsx"]
SettingsPage --> PrivacyTab["PrivacyTab.tsx"]
SettingsPage --> PreferencesTab["PreferencesTab.tsx"]
NotificationsTab --> NotifHook["useNotificationSettings.ts"]
PrivacyTab --> GdprSvc["gdpr.service.ts"]
ProfileTab --> GdprSvc
SettingsPage --> AccountSwitcher["AccountSwitcher.tsx"]
AccountSwitcher --> AccountContext["AccountContextProvider.tsx"]
```

**Diagram sources**
- [apps/minside/src/features/settings/types.ts](file://apps/minside/src/features/settings/types.ts#L11-L168)
- [apps/minside/src/routes/settings.tsx](file://apps/minside/src/routes/settings.tsx#L46-L977)
- [apps/minside/src/features/settings/components/NotificationsTab.tsx](file://apps/minside/src/features/settings/components/NotificationsTab.tsx#L19-L131)
- [apps/minside/src/features/settings/hooks/useNotificationSettings.ts](file://apps/minside/src/features/settings/hooks/useNotificationSettings.ts#L26-L179)
- [apps/minside/src/features/settings/components/PrivacyTab.tsx](file://apps/minside/src/features/settings/components/PrivacyTab.tsx#L34-L264)
- [packages/client-sdk/src/services/gdpr.service.ts](file://packages/client-sdk/src/services/gdpr.service.ts#L17-L88)
- [apps/minside/src/components/AccountSwitcher.tsx](file://apps/minside/src/components/AccountSwitcher.tsx#L71-L415)
- [apps/minside/src/providers/AccountContextProvider.tsx](file://apps/minside/src/providers/AccountContextProvider.tsx#L83-L334)

**Section sources**
- [apps/minside/src/features/settings/types.ts](file://apps/minside/src/features/settings/types.ts#L11-L168)
- [apps/minside/src/features/settings/hooks/useNotificationSettings.ts](file://apps/minside/src/features/settings/hooks/useNotificationSettings.ts#L26-L179)
- [packages/client-sdk/src/services/gdpr.service.ts](file://packages/client-sdk/src/services/gdpr.service.ts#L17-L88)

## Performance Considerations
- Debounce or batch saves for frequent preference toggles to reduce backend calls.
- Lazy-load heavy tabs (e.g., Privacy) to minimize initial render cost.
- Use optimistic updates for quick feedback during avatar upload and consent changes, with rollback on failure.
- Cache tenant settings locally to avoid repeated fetches during a session.

## Troubleshooting Guide
- Avatar upload fails: Verify file type and size limits; confirm network connectivity; check SDK response handling.
- Notification settings not saving: Ensure tenant settings are loaded; validate reminder hours; inspect mutation error callbacks.
- Privacy export/download issues: Confirm user is logged in; verify backend endpoint availability; check browser download permissions.
- Account switch does nothing: Confirm organizations are fetched; check local storage keys; ensure organization membership is valid.
- Consent updates not reflected: Refresh page or re-fetch consent data; verify backend response.

**Section sources**
- [apps/minside/src/features/settings/components/ProfileTab.tsx](file://apps/minside/src/features/settings/components/ProfileTab.tsx#L146-L170)
- [apps/minside/src/features/settings/hooks/useNotificationSettings.ts](file://apps/minside/src/features/settings/hooks/useNotificationSettings.ts#L90-L113)
- [apps/minside/src/features/settings/components/PrivacyTab.tsx](file://apps/minside/src/features/settings/components/PrivacyTab.tsx#L65-L103)
- [apps/minside/src/components/AccountSwitcher.tsx](file://apps/minside/src/components/AccountSwitcher.tsx#L102-L116)
- [apps/minside/src/providers/AccountContextProvider.tsx](file://apps/minside/src/providers/AccountContextProvider.tsx#L195-L229)

## Conclusion
The settings system provides a cohesive, modular approach to user profile management, preferences, privacy controls, and account switching. It leverages SDK services for backend integration, maintains state with hooks, and persists critical selections locally. The architecture supports extensibility for additional preferences and theme customization while ensuring GDPR-aligned data handling and user control.