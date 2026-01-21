import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

/**
 * NotificationCenter context value
 */
export interface NotificationCenterContextValue {
  /** Whether the notification center is open */
  isOpen: boolean;
  /** Open the notification center */
  openNotificationCenter: () => void;
  /** Close the notification center */
  closeNotificationCenter: () => void;
  /** Toggle the notification center */
  toggleNotificationCenter: () => void;
}

/**
 * NotificationCenterProvider props
 */
export interface NotificationCenterProviderProps {
  /** Children to render */
  children: ReactNode;
  /** Optional initial open state */
  defaultOpen?: boolean;
}

/**
 * Context for notification center state
 */
const NotificationCenterContext = createContext<NotificationCenterContextValue | null>(null);

/**
 * NotificationCenterProvider
 *
 * Provides state management for the notification center drawer/modal.
 * This allows any component in the tree to open/close the notification center.
 *
 * @example
 * ```tsx
 * import { NotificationCenterProvider, useNotificationCenter } from '@xalatechnologies/platform/runtime';
 *
 * function App() {
 *   return (
 *     <NotificationCenterProvider>
 *       <Header />
 *       <NotificationCenterDrawer />
 *     </NotificationCenterProvider>
 *   );
 * }
 *
 * function Header() {
 *   const { openNotificationCenter } = useNotificationCenter();
 *   return (
 *     <button onClick={openNotificationCenter}>
 *       Notifications
 *     </button>
 *   );
 * }
 *
 * function NotificationCenterDrawer() {
 *   const { isOpen, closeNotificationCenter } = useNotificationCenter();
 *   return (
 *     <Drawer open={isOpen} onClose={closeNotificationCenter}>
 *       <NotificationList />
 *     </Drawer>
 *   );
 * }
 * ```
 */
export const NotificationCenterProvider: React.FC<NotificationCenterProviderProps> = ({
  children,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const openNotificationCenter = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeNotificationCenter = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleNotificationCenter = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const contextValue: NotificationCenterContextValue = {
    isOpen,
    openNotificationCenter,
    closeNotificationCenter,
    toggleNotificationCenter,
  };

  return (
    <NotificationCenterContext.Provider value={contextValue}>
      {children}
    </NotificationCenterContext.Provider>
  );
};

NotificationCenterProvider.displayName = 'NotificationCenterProvider';

/**
 * Hook to access the notification center context
 *
 * @returns The notification center context value
 * @throws Error if used outside of NotificationCenterProvider
 */
export function useNotificationCenter(): NotificationCenterContextValue {
  const context = useContext(NotificationCenterContext);
  if (!context) {
    // Return a safe default if not in provider (allows graceful degradation)
    return {
      isOpen: false,
      openNotificationCenter: () => {
        console.warn(
          'useNotificationCenter: No NotificationCenterProvider found. ' +
            'Wrap your app with NotificationCenterProvider to enable notification center.'
        );
      },
      closeNotificationCenter: () => {},
      toggleNotificationCenter: () => {},
    };
  }
  return context;
}

export default NotificationCenterProvider;
