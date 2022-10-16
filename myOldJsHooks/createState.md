```js
import {useEffect, useState} from 'react';
import {useIsMounted} from './hooks.md';
import {
		getIn,
		isArray,
		isFunc,
		isObj,
		isString,
		setIn,
		isEqual,
		deepMerge,
		localStore,
		deepCopy,
		Subie
} from '@iosio/util'; // will be using newly converted ts lib (rebranded from iosio to evatrium)

const getStateUpdate = (updater, prev) => (isFunc(updater) ? updater(prev) : updater);

const isNotEqual = (a, b) => !isEqual(a, b);

export const createState = (
		initialState = {},
		{
				merger = (target, source, options) => ({...target, ...source}),
				mergerOptions,
				selectorShouldUpdate = isNotEqual,
				interceptChange = (next, prev) => next,
				persist: {
						key: storageKey,
						selectPersistedState = (s) => s,
						hydrate = (currentState, storedState) => storedState,
						initialSubscribe = true
				} = {}
		} = {}
) => {
		const originalState = deepCopy(initialState);

		//-------------- persistence ---------------
		let unsubscribePersistence = () => 0;
		let subscribePersistence = () => 0;

		if (storageKey) {
				const storedState = localStore.getItem(storageKey);

				if (storedState) initialState = hydrate(originalState, storedState);

				subscribePersistence = () => {
						unsubscribePersistence();

						const unsubscribeSelection = subscribeToSelection(selectPersistedState, (selectedState) =>
								localStore.setItemDebounced(storageKey, selectedState)
						);

						const unsubscribeStorage = localStore.subscribeToKey(storageKey, (storedState) =>
								setState(hydrate(state, storedState))
						);

						unsubscribePersistence = () => {
								unsubscribeSelection();
								unsubscribeStorage();
						};

						return unsubscribePersistence;
				};
		} //-----------------------------

		let state = deepCopy(initialState);

		let prevState = deepCopy(state);

		const getState = () => state;

		const reset = (initialState = originalState, ignoreNotify = false) =>
				setState(initialState, ignoreNotify);

		const [subscribe, notify, unsubscribe] = Subie();

		const _commit = (next, ignoreNotify = false) => {
				prevState = state;
				state = interceptChange(next, prevState);
				if (!ignoreNotify) notify(state, prevState);
		};

		const setState = (updater, ignoreNotify) => _commit(getStateUpdate(updater, state), ignoreNotify);

		const mergeState = (updater, ignoreNotify, _mergerOptions = mergerOptions) => {
				const copyToMutate = deepCopy(state);
				const update = getStateUpdate(updater, copyToMutate);
				const nextState = merger(copyToMutate, update, _mergerOptions);
				_commit(nextState, ignoreNotify);
		};

		const select = (selector, _state = state) => {
				if (!selector) return _state;
				if (isFunc(selector)) return selector(_state);
				if (isObj(selector)) {
						let out = {};
						for (let key in selector) out[key] = select(selector[key], _state);
						return out;
				}
				if (isArray(selector)) {
						let out = [];
						for (let s = 0; s < selector.length; s++) out.push(select(selector[s], _state));
						return out;
				}
				if (isString(selector)) {
						let possibleMany = selector
								.split(',')
								.map((s) => s.trim())
								.filter(Boolean);
						if (possibleMany.length > 1) return select(possibleMany, _state);
						return getIn(_state, possibleMany[0], undefined);
				}
		};

		const _setInState = (nextState, path, updater) => {
				let branchUpdate = updater;
				if (isFunc(updater)) branchUpdate = updater(getIn(state, path, state));
				return setIn(nextState, path, branchUpdate);
		};

		const _setInPath = (nextState, path, updater) => {
				if (isFunc(path)) path = path(nextState);
				if (isString(path)) nextState = _setInState(nextState, path, updater);
				if (isObj(path)) for (let key in path) nextState = _setInState(nextState, key, path[key]);
				return nextState;
		};

		const setInPath = (path, updater, ignoreNotify) =>
				_commit(_setInPath(deepCopy(state), path, updater), ignoreNotify);

		const subscribeToSelection = (
				selector,
				callback,
				{shouldUpdate = selectorShouldUpdate} = {}
		) => {
				const listener = (nextState, prevState) => {
						let prevSelected = select(selector, prevState),
								nextSelected = select(selector, nextState);
						if (shouldUpdate(prevSelected, nextSelected)) callback(nextSelected, prevSelected);
				};
				return subscribe(listener);
		};

		Object.assign(mergeState, {setInPath, setState, mergeState});

		// alias: useSelector
		const use = (selector, {shouldUpdate = selectorShouldUpdate} = {}) => {
				const mountedState = useIsMounted();
				const [value, setValue] = useState(() => select(selector));
				const set = (x) => mountedState.current && setValue(x);
				useEffect(() => subscribeToSelection(selector, set, {shouldUpdate}), []);
				return [value, mergeState]; // = [value, {mergeState, setInPath, setState}]
		};

		initialSubscribe && subscribePersistence();

		return {
				select,
				subscribeToSelection,
				subscribe,
				unsubscribe,
				notify,
				getState,
				setState,
				mergeState,
				setInPath,
				use,
				useSelector: use,
				reset,
				deepMerge,
				unsubscribePersistence,
				subscribePersistence
		};
};

```
