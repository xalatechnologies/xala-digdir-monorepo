Below is a practical, buildable inventory of reusable components for Digilist, designed to be composed strictly from Digdir Designsystemet primitives + your design tokens.

I’m splitting it into 4 layers so it’s easy to enforce: Primitives → Form Blocks → Layout Shells → Domain Modules.

⸻

A. Design Token Foundation (what every component must consume)

These token groups must be the only styling inputs (no ad-hoc CSS):
	•	Color tokens: surface/*, text/*, border/*, state/* (focus/hover/selected/disabled), status/* (success/warn/error/info)
	•	Typography tokens: font/*, text-size/*, line-height/*, font-weight/*
	•	Spacing tokens: space/* (padding/margins/gap)
	•	Radius tokens: radius/*
	•	Shadow tokens: shadow/* (use sparingly)
	•	Z-index tokens: z/* (dropdown, modal, toast)
	•	Motion tokens: duration/*, easing/*
	•	Breakpoint tokens: bp/*
	•	Size tokens: size/* (inputs, buttons, icon sizes, avatar sizes)

Rule: Every component accepts a variant and size that map only to tokens.

⸻

B. Primitive Components (wrap Digdir UI, no business logic)

These are thin wrappers around Digdir components, normalized for your platform.

1) Typography & Content
	•	Text (variants: body, muted, caption)
	•	Heading (h1–h6 tokens)
	•	Link
	•	Icon
	•	Divider
	•	Label
	•	Badge (status variants)
	•	Tag (filter chips)

2) Actions
	•	Button (primary/secondary/tertiary/danger)
	•	IconButton
	•	ButtonGroup
	•	SplitButton (rare but useful for admin)

3) Inputs
	•	TextField
	•	TextArea
	•	NumberField
	•	Select
	•	MultiSelect
	•	Checkbox
	•	RadioGroup
	•	Switch
	•	DatePicker
	•	TimePicker
	•	DateRangePicker
	•	SearchInput
	•	FileUpload

4) Feedback
	•	Alert (success/info/warn/error)
	•	Toast / NotificationToast
	•	InlineError
	•	EmptyState
	•	Skeleton
	•	Spinner
	•	ProgressBar

5) Overlays
	•	Modal
	•	Drawer (right-side form drawer for Backoffice)
	•	Popover
	•	Tooltip
	•	ConfirmDialog

6) Navigation Primitives
	•	Tabs
	•	Breadcrumbs
	•	Pagination
	•	Stepper

⸻

C. Form Blocks (reusable “smart UI”, still not business logic)

These are composable blocks that standardize patterns across the whole platform.

1) Form Infrastructure
	•	Form (react-hook-form wrapper)
	•	FormField (label + control + help + error)
	•	FieldRow / FieldGrid
	•	FormActions (primary + secondary + danger)
	•	Rfc7807ErrorSummary (global form error adapter)

2) Data Entry Blocks
	•	AddressBlock
	•	ContactBlock
	•	DateTimeBlock (date + time + timezone rules)
	•	PriceRuleBlock (inputs + validation UI)
	•	ConsentBlock (GDPR checkboxes + info links)

⸻

D. Layout Shell Components (the “no raw HTML in pages” enforcer)

These are the mandatory building blocks for each app surface.

1) App Shells
	•	PublicAppShell
	•	PublicHeader
	•	PublicFooter
	•	PublicTopNav
	•	DashboardShell (Backoffice)
	•	SidebarNav
	•	TopBar
	•	TenantSwitcher
	•	UserMenu
	•	GlobalSearch
	•	RightDrawerSlot (forms, quick actions)
	•	ContentArea

2) Navigation & Structure
	•	SideNavSection
	•	SideNavItem
	•	PageHeader (title + subtitle + actions)
	•	SectionHeader
	•	StickyActionBar (mobile-first)
	•	ResponsiveTwoPane (list/detail master-detail)

3) Guards & Providers (reusable logic components, not UI)
	•	RoleGuard
	•	CapabilityGuard
	•	TenantScopeGuard
	•	ErrorBoundaryShell
	•	RealtimeConnectionIndicator

⸻

E. Data Display Components (enterprise-grade reuse)

1) Lists & Cards
	•	ResourceCard (listing preview)
	•	BookingCard (status + actions)
	•	UserCard
	•	OrgCard
	•	MessageCard
	•	StatCard

2) Tables & Views
	•	DataTable (sorting, filtering, column presets)
	•	TableToolbar (search, filters, export)
	•	FilterBar (chips + clear all)
	•	ViewToggle (grid/list/map)
	•	DetailPanel (right-side inspector)

3) Status & Timeline
	•	StatusPill (maps booking statuses to tokens)
	•	BookingTimeline (created → approved → completed)
	•	AuditTimeline (event feed)

⸻

F. Domain Modules (Digilist-specific composite components)

These are where your product differentiates, but still reusable across pages.

1) Public Booking Modules
	•	ListingSearch (search + filters)
	•	ListingResults (grid/list/map)
	•	ListingDetails
	•	AvailabilityCalendar (read-only)
	•	BookingWizard
	•	Step 1: Choose slot
	•	Step 2: Details
	•	Step 3: Confirmation
	•	Step 4: Receipt/status
	•	WidgetEmbedFrame (widgets UI container)

2) User Modules
	•	MyBookingsList
	•	BookingDetails
	•	CancelBookingDialog
	•	ConversationThread
	•	NotificationsCenter

3) Saksbehandler Modules
	•	IncomingBookingsQueue
	•	BookingReviewPanel
	•	ApproveRejectActions
	•	AllocationManager
	•	ListingManager

4) Admin Modules
	•	UserManagementTable
	•	OrgManagementTable
	•	SettingsPanel
	•	IntegrationsPanel (RCO/Visma/Vipps)
	•	MonitoringDashboard
	•	AuditLogExplorer (filterable + realtime)

5) TenantAdmin Modules
	•	SubscriptionOverview
	•	PlanSelector
	•	BillingHistory
	•	TenantConfiguration

⸻

G. Component Standards (so they remain reusable)

Every reusable component must support:
	•	size: sm | md | lg
	•	variant: semantic (primary/secondary/danger/ghost, etc.)
	•	loading, disabled, readOnly
	•	i18nKey support (no hardcoded strings)
	•	testId (Playwright)
	•	a11y: aria labels, focus ring tokens, keyboard navigation
	•	error support (RFC7807 adapter compatible)

No component may import API directly.
UI components may only use: SDK hooks, stores, adapters.