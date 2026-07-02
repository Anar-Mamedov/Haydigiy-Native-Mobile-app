import { PropsWithChildren, ReactNode, useEffect, useState } from 'react';
import { InteractionManager } from 'react-native';

type DeferredMountProps = PropsWithChildren<{
  /** Rendered until pending interactions settle (defaults to nothing). */
  placeholder?: ReactNode;
}>;

/**
 * Defers mounting its children until pending interactions/animations finish
 * (`InteractionManager.runAfterInteractions`), so a heavy subtree does not
 * commit in the middle of a navigation transition and drop frames. If nothing
 * is animating when it mounts, the children appear on the next tick.
 */
export function DeferredMount({ children, placeholder = null }: DeferredMountProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => setReady(true));
    return () => task.cancel();
  }, []);

  return <>{ready ? children : placeholder}</>;
}
