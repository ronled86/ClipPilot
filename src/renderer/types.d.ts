import type { Api } from '../preload'

declare global {
  interface Window {
    clippilot: Api
    __REACT_DEVTOOLS_GLOBAL_HOOK__?: {
      isDisabled: boolean
      supportsFiber: boolean
      inject: () => void
      onCommitFiberRoot: () => void
      onCommitFiberUnmount: () => void
    }
  }
}
