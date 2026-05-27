export interface ApiError {
  error: string
  status?: number
}

/** Standard async UI state for data-fetching surfaces. */
export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: ApiError }
  | { status: 'empty' }
