# Add React Query hooks for Widget Service

## Overview

Create use-widgets.ts hook file with React Query hooks for widget CRUD operations including useWidgets, useWidget, useCreateWidget, useUpdateWidget, useDeleteWidget, and useWidgetEmbedCode following the established hook pattern.

## Rationale

The widget.service.ts already exists with complete CRUD operations (getAll, getById, create, update, delete, getEmbedCode, preview) but has no corresponding React Query hooks. Every other service with CRUD operations has hooks (discount-codes, reviews, conversations, etc.). This is a clear gap the code reveals.

---
*This spec was created from ideation and is pending detailed specification.*
