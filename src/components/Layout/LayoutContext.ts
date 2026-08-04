import { createContext, useContext } from 'react'

/**
 * Shared layout state. Content reports how much width it needs (`setMinContent`);
 * the Layout flips to the stacked mobile view once the space left beside the
 * full Navigation drops below that — so each page controls its own breakpoint.
 */
export interface LayoutValue {
  isMobile: boolean
  setMinContent: (px: number) => void
}

export const LayoutContext = createContext<LayoutValue>({
  isMobile: false,
  setMinContent: () => {},
})

export const useLayout = () => useContext(LayoutContext)
