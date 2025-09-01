/* eslint-disable */

import { Uppy, State } from "@uppy/core";
import { useMemo } from "react";
import { useSyncExternalStoreWithSelector } from "use-sync-external-store/shim/with-selector";

// TODO: types need to wait https://github.com/transloadit/uppy/issues/4698
export function useUppyState<
    T,
    // eslint-disable-next-line
    TMeta extends Record<string, unknown> = Record<string, unknown>
>(uppy: Uppy<TMeta>, selector: (state: State<TMeta, any>) => T) {
    const store = (uppy as any).store;

    const subscribe = useMemo(() => store.subscribe.bind(store), [store]);
    const getSnapshot = useMemo(() => store.getState.bind(store), [store]);

    return useSyncExternalStoreWithSelector(
        subscribe,
        getSnapshot,
        getSnapshot,
        selector
    );
}
