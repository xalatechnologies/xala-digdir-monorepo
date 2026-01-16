/**
 * Case Handler Scope Module
 * Exports controller and service for managing case handler scopes
 */
export { CaseHandlerScopeController } from './case-handler-scope.controller';
export { CaseHandlerScopeService, getCaseHandlerScopeService } from './case-handler-scope.service';
export type {
  CaseHandlerScopeQueryParams,
  CreateCaseHandlerScopeInput,
  UpdateCaseHandlerScopeInput,
} from './case-handler-scope.service';
