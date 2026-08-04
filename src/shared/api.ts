export const API_GLOBAL_PREFIX = 'api';
export const API_DEFAULT_VERSION = '1';

export const AUTH_CONTROLLER_PATH = 'auth';
export const AUTH_REFRESH_ROUTE = 'refresh';
export const AUTH_LOGOUT_ROUTE = 'logout';

// Base path for auth routes, e.g. /api/v1/auth
export const AUTH_BASE_PATH = `/${API_GLOBAL_PREFIX}/v${API_DEFAULT_VERSION}/${AUTH_CONTROLLER_PATH}`;
