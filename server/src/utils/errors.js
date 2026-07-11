import { ApolloError } from 'apollo-server-express';

/**
 * 401 — caller has no valid identity (not logged in)
 */
export class AuthenticationError extends ApolloError {
  constructor(message = 'You must be logged in to perform this action.') {
    super(message, 'UNAUTHENTICATED');
    Object.defineProperty(this, 'name', { value: 'AuthenticationError' });
  }
}

/**
 * 403 — caller is identified but lacks the required role/permission
 */
export class AuthorizationError extends ApolloError {
  constructor(message = 'You do not have permission to perform this action.') {
    super(message, 'FORBIDDEN');
    Object.defineProperty(this, 'name', { value: 'AuthorizationError' });
  }
}

/**
 * 404 — the requested resource does not exist
 */
export class NotFoundError extends ApolloError {
  constructor(resource = 'Resource') {
    super(`${resource} not found.`, 'NOT_FOUND');
    Object.defineProperty(this, 'name', { value: 'NotFoundError' });
  }
}

/**
 * 400 — the caller provided invalid or missing input
 */
export class ValidationError extends ApolloError {
  constructor(message = 'Invalid input provided.') {
    super(message, 'VALIDATION_ERROR');
    Object.defineProperty(this, 'name', { value: 'ValidationError' });
  }
}

/**
 * 409 — the resource already exists (duplicate)
 */
export class ConflictError extends ApolloError {
  constructor(message = 'This resource already exists.') {
    super(message, 'CONFLICT');
    Object.defineProperty(this, 'name', { value: 'ConflictError' });
  }
}

/**
 * 422 — business rule violated (e.g. booking own tour, reviewing without completion)
 */
export class BusinessRuleError extends ApolloError {
  constructor(message) {
    super(message, 'BUSINESS_RULE_VIOLATION');
    Object.defineProperty(this, 'name', { value: 'BusinessRuleError' });
  }
}
