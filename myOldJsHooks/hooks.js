// import { useRef, useEffect, useLayoutEffect, useCallback, useState, useMemo } from 'react';
// import {
// 	combineArraysAndDeduplicate,
// 	createIsInArray,
// 	excludeItemsFromAray,
// 	getItemsThatExistInBothArrays,
// 	getStateUpdate,
// 	isArray,
// 	isFunc,
// 	isObj,
// 	propsChanged,
// 	toggleSelection,
// 	debounce,
// 	stringify,
// 	localStore,
// 	eventListener,
// 	isString,
// 	isBrowser,
// 	jsonParse,
// 	shallowEqual,
// 	isEqual
// } from '@iosio/util'; // will be using newly converted ts lib (rebranded from iosio to evatrium)
//
// import { SearchWorker } from 'search-worker';
//
// /*################################
// ##################################
//
//           MISC. UTIL
//
// ##################################
// ################################*/
// const EMPTY_ARRAY = [];
// const FUNCTION = () => undefined;
//
// let id = 1;
// export const useId = () => useMemo(() => id++, []);
//
// export const useMemoObj = (obj) => useMemo(() => obj, Object.values(obj));
//
// /*################################
// ##################################
//
//            LIFE CYCLES
//
// ##################################
// ################################*/
//
// export const useEnhancedEffect = isBrowser ? useLayoutEffect : useEffect;
//
// export const useIsMounted = () => {
// 	const isMounted = useRef(false);
//
// 	useEffect(() => {
// 		isMounted.current = true;
// 		return () => {
// 			isMounted.current = false;
// 		};
// 	}, []);
//
// 	return isMounted;
// };
//
// export const useWillMount = (f) => useMemo(f, []);
//
// export const useDidMount = (f) => useEffect(f, []);
//
// export const useDidUpdate = (cb, deps = []) => {
// 	const initialRef = useRef(true);
// 	useEffect(() => {
// 		if (!initialRef.current) cb(...deps);
// 		initialRef.current = false;
// 	}, [...deps]);
// };
//
// export const useWillUnmount = (f, deps = EMPTY_ARRAY) => useEffect(() => f, deps);
//
// const newObj = () => Object.create(null);
// export const useForceUpdate = () => {
// 	const isMounted = useIsMounted();
// 	const [, set] = useState(newObj);
// 	return useCallback(() => isMounted.current && set(newObj()), []);
// };
//
// /*################################
// ##################################
//
//             STATE
//
// ##################################
// ################################*/
//
// export const shallowMerger = (prev, next) => ({ ...prev, ...next });
// export const useMergeState = (initialState = {}, merger = shallowMerger) => {
// 	const [state, setState] = useState(initialState);
//
// 	const mergeState = useCallback((update) => {
// 		setState((prev) => {
// 			const next = getStateUpdate(update, prev);
// 			return merger(prev, next);
// 		});
// 	}, []);
//
// 	return [state, mergeState];
// };
//
// /*################################
// ##################################
//
//            DIFFING
//
// ##################################
// ################################*/
//
// export const useShallowObjectChangedFlag = (obj, skipDiffProps, objChanged = propsChanged) => {
// 	const hasMounted = useIsMounted(); // only check if the component updated, not on mount
// 	const prev = useRef(obj);
// 	const changed = useRef(1);
// 	if (!skipDiffProps && hasMounted.current && objChanged(obj, prev.current)) {
// 		changed.current = changed.current === 1 ? 2 : 1;
// 	}
// 	prev.current = obj;
// 	return changed.current;
// };
//
// const isShallowEqual = (depsA = [], depsB = []) => {
// 	if (depsA.length !== depsB.length) {
// 		return false;
// 	}
// 	return depsA.every((a, index) => shallowEqual(a, depsB[index]));
// };
//
// const useEqualEffect = (compareFn, f, deps) => {
// 	const ref = useRef([]);
// 	if (!compareFn(ref.current, deps)) {
// 		ref.current = deps;
// 	}
// 	useEffect(f, ref.current);
// };
//
// export const useShallowEqualEffect = (f, deps) => {
// 	useEqualEffect(isShallowEqual, f, deps);
// };
//
// export const useDeepEqualEffect = (f, deps) => {
// 	useEqualEffect(isEqual, f, deps);
// };
//
// export const useDeepEqualMemo = (f, deps) => {
// 	const ref = useRef([]);
// 	if (!isEqual(ref.current, deps)) {
// 		ref.current = deps;
// 	}
// 	return useMemo(f, ref.current);
// };
//
// /*################################
// ##################################
//
//            TIMING
//
// ##################################
// ################################*/
//
// export const useInterval = (func, { time = 1000, immediate } = {}) => {
// 	const isMounted = useIsMounted();
// 	const interval = useRef();
// 	const stop = useCallback(() => {
// 		clearInterval(interval.current);
// 	}, [interval]);
// 	const start = useCallback(() => {
// 		stop();
// 		interval.current = setInterval(() => {
// 			isMounted.current && isFunc(func) && func({ start, stop });
// 		}, time);
// 	}, [stop, func, isMounted]);
//
// 	useEffect(() => {
// 		if (immediate) start();
// 		return stop;
// 	}, [start, stop, immediate]);
//
// 	return useMemo(() => ({ start, stop }), [start, stop]);
// };
//
// export const useForceUpdateInterval = ({ time = 1000, immediate } = {}) => {
// 	const fu = useForceUpdate();
// 	return useInterval(fu, { time, immediate });
// };
//
// export const useTimeoutBooleanTrigger = ({ time = 500, defaultBoolean = false, callback }) => {
// 	const [bool, setBool] = useState(defaultBoolean);
// 	const isMountedRef = useIsMounted();
// 	const timeout = useRef();
// 	const trigger = useCallback(
// 		({ callback: cb } = {}) =>
// 			new Promise((resolve) => {
// 				cb = cb || callback;
// 				clearTimeout(timeout.current);
// 				if (!defaultBoolean) setBool(!defaultBoolean);
// 				timeout.current = setTimeout(() => {
// 					isMountedRef.current && setBool(defaultBoolean);
// 					cb && cb();
// 					resolve();
// 				}, time);
// 			}),
// 		[]
// 	);
// 	return [bool, trigger];
// };
//
// export const useTimeout = ({ time = 1000, callback } = {}) => {
// 	const timeout = useRef();
// 	const isMounted = useIsMounted();
//
// 	const cancel = useCallback(() => {
// 		clearTimeout(timeout.current);
// 	}, []);
//
// 	const trigger = useCallback(
// 		(cb) => {
// 			cancel();
// 			timeout.current = setTimeout(() => {
// 				isMounted.current && (cb || callback)();
// 			}, time);
// 		},
// 		[callback]
// 	);
//
// 	const useTriggerEffect = (cb) => {
// 		useEffect(() => {
// 			trigger(cb);
// 		}, []);
// 	};
//
// 	return {
// 		trigger,
// 		cancel,
// 		useTriggerEffect
// 	};
// };
//
// export const useDebounce = (fn, wait = 166) => {
// 	const isMountedRef = useIsMounted();
// 	const clearRef = useRef(null);
// 	return useMemo(() => {
// 		clearRef.current && clearRef.current();
// 		const debounced = debounce((...args) => {
// 			if (!isMountedRef.current) {
// 				debounced.clear();
// 				return;
// 			}
// 			fn && fn(...args);
// 		}, wait);
// 		clearRef.current = debounced.clear;
// 		return debounced;
// 	}, [isMountedRef.current, fn, wait]);
// };
//
// /*################################
// ##################################
//
// INPUTS, TOGGLE/CHECKBOX, MENU, ARIA
//
// ##################################
// ################################*/
//
// export const useToggle = (defaultBool) => {
// 	const [bool, setBool] = useState(!!defaultBool);
// 	const toggle = useCallback(
// 		(override) => {
// 			setBool((b) => (typeof override === 'boolean' ? override : !b));
// 		},
// 		[setBool]
// 	);
// 	return useMemo(() => [bool, toggle], [bool, toggle]);
// };
//
// export const useAriaCheckboxState = (initial) => {
// 	const [checked, set] = useState(initial);
//
// 	const onChange = useCallback((e) => set(e.target.checked), []);
// 	const reset = useCallback(() => set(initial), []);
//
// 	const bindCheckBox = {
// 		role: 'checkbox',
// 		'aria-checked': checked,
// 		checked,
// 		onChange
// 	};
//
// 	const bind = {
// 		role: 'checkbox',
// 		'aria-checked': checked,
// 		checked,
// 		onClick: useCallback(() => set((x) => !x))
// 	};
//
// 	return {
// 		bindCheckBox,
// 		set,
// 		checked,
// 		reset,
// 		bind
// 	};
// };
//
// export const useAriaMenuState = ({ ariaName = 'menu', contents = 'items' } = {}) => {
// 	const ref = useRef(null);
// 	const id = useId();
// 	const ariaId = `${ariaName}-${id}`;
// 	const triggerId = `${ariaId}-trigger-${id}`;
//
// 	const [isOpen, setOpen] = useState(false);
//
// 	const open = useCallback(() => setOpen(true), [setOpen]);
// 	const close = useCallback(() => setOpen(false), [setOpen]);
//
// 	const triggerProps = {
// 		id: triggerId,
// 		'aria-haspopup': 'menu',
// 		...(isOpen && {
// 			'aria-expanded': 'true',
// 			'aria-controls': ariaId
// 		}),
// 		ref,
// 		onClick: open,
// 		'aria-label': `${ariaName}. ${isOpen ? 'Menu expanded' : `Select to access ${contents}`}`
// 	};
//
// 	const menuProps = {
// 		id: ariaId,
// 		'aria-labelledby': triggerId
// 	};
//
// 	return {
// 		isOpen,
// 		open,
// 		close,
// 		triggerProps,
// 		menuProps
// 	};
// };
//
// export const useMuiMenuState = ({
// 	ariaName = 'menu',
// 	contents = 'items',
// 	listWidth = 'auto',
// 	dropFrom = 'center',
// 	ariaLabelOpen = 'Menu expanded',
// 	ariaLabelClosed = `Select to access ${contents}`,
// 	menuProps: _menuProps = {}
// } = {}) => {
// 	const ref = useRef(null);
// 	const id = useId();
// 	const ariaId = `${ariaName}-${id}`;
// 	const triggerId = `${ariaId}-trigger-${id}`;
//
// 	const [isOpen, setOpen] = useState(false);
//
// 	const open = useCallback(() => setOpen(true), [setOpen]);
// 	const close = useCallback(() => setOpen(false), [setOpen]);
//
// 	const triggerProps = {
// 		id: triggerId,
// 		'aria-haspopup': 'menu',
// 		...(isOpen && {
// 			'aria-expanded': 'true',
// 			'aria-controls': ariaId
// 		}),
// 		ref,
// 		onClick: open,
// 		onTouchStart: open,
// 		'aria-label': `${ariaName}. ${isOpen ? ariaLabelOpen : ariaLabelClosed}`
// 	};
//
// 	const menuProps = {
// 		id: ariaId,
// 		MenuListProps: { 'aria-labelledby': triggerId },
// 		keepMounted: true,
// 		onClose: close,
// 		PaperProps: { style: { width: listWidth } },
// 		anchorEl: ref.current,
// 		open: isOpen,
// 		..._menuProps,
// 		anchorOrigin: {
// 			vertical: 'bottom',
// 			horizontal: dropFrom,
// 			..._menuProps.anchorOrigin
// 		},
// 		transformOrigin: {
// 			vertical: 'top',
// 			horizontal: dropFrom,
// 			..._menuProps.transformOrigin
// 		}
// 	};
//
// 	return {
// 		isOpen,
// 		open,
// 		close,
// 		triggerProps,
// 		menuProps
// 	};
// };
//
// export const useUncontrolledInputValue = (onChange) => {
// 	const valueRef = useRef('');
// 	const ref = useRef(null);
// 	useEffect(() => {
// 		const onInput = (e) => {
// 			const value = e.target.value;
// 			valueRef.current = value;
// 			onChange && onChange(value);
// 		};
// 		const change = (e) => {
// 			const value = e.target.value;
// 			if (valueRef.current !== value) {
// 				onChange && onChange(value);
// 			}
// 			valueRef.current = value;
// 		};
//
// 		const _ref = ref.current;
//
// 		if (_ref) {
// 			_ref.addEventListener('input', onInput);
// 			_ref.addEventListener('change', change);
// 		}
//
// 		return () => {
// 			if (_ref) {
// 				_ref.removeEventListener('input', onInput);
// 				_ref.removeEventListener('change', change);
// 			}
// 		};
// 	}, [onChange]);
//
// 	return ref;
// };
//
// export const useTextField = ({
// 	label: initialLabel = '',
// 	value: initialValue = '',
// 	errorText: initialErrorText = '',
// 	helperText: initialHelperText = ''
// } = {}) => {
// 	const [{ label, value, errorText, helperText }, mergeState] = useMergeState({
// 		label: initialLabel,
// 		value: initialValue,
// 		errorText: initialErrorText,
// 		helperText: initialHelperText
// 	});
//
// 	const onChange = useCallback((e) => mergeState({ value: e.target.value }), []);
//
// 	return {
// 		label,
// 		value,
// 		errorText,
// 		helperText,
// 		mergeState,
// 		onChange,
// 		reset: () =>
// 			mergeState({
// 				label: initialLabel,
// 				value: initialValue,
// 				errorText: initialErrorText,
// 				helperText: initialHelperText
// 			}),
// 		textFieldBind: {
// 			label,
// 			value,
// 			errorText,
// 			helperText
// 		},
// 		bind: {
// 			value,
// 			onChange
// 		}
// 	};
// };
// /*################################
// ##################################
//
//             MISC
//
// ##################################
// ################################*/
//
// export const useLoaded = ({ crossOrigin, referrerPolicy, src, srcSet } = {}) => {
// 	const [loaded, setLoaded] = useState(false);
//
// 	useEffect(() => {
// 		if (!src && !srcSet) {
// 			return undefined;
// 		}
//
// 		setLoaded(false);
//
// 		let active = true;
// 		const image = new Image();
// 		image.onload = () => {
// 			if (!active) {
// 				return;
// 			}
// 			setLoaded('loaded');
// 		};
// 		image.onerror = () => {
// 			if (!active) {
// 				return;
// 			}
// 			setLoaded('error');
// 		};
// 		image.crossOrigin = crossOrigin;
// 		image.referrerPolicy = referrerPolicy;
// 		image.src = src;
// 		if (srcSet) {
// 			image.srcset = srcSet;
// 		}
//
// 		return () => {
// 			active = false;
// 		};
// 	}, [crossOrigin, referrerPolicy, src, srcSet]);
//
// 	return loaded;
// };
//
// /*################################
// ##################################
//
//         EVENTS, SUBSCRIPTIONS
//
// ##################################
// ################################*/
//
// const Sub = (args = EMPTY_ARRAY, data = FUNCTION, error = FUNCTION) => FUNCTION;
//
// const initialSubscriptionState = { data: null, pending: false, error: null };
//
// export const useSubscription = (
// 	sub = Sub,
// 	args = EMPTY_ARRAY,
// 	initialState = initialSubscriptionState
// ) => {
// 	const isMountedRef = useIsMounted();
// 	const [{ data, pending, error }, mergeState] = useMergeState(initialState);
//
// 	useEffect(() => {
// 		mergeState({ data, pending: true, error: null });
// 		return sub(
// 			args,
// 			(data) => isMountedRef.current && mergeState({ data, pending: false, error: null }),
// 			(error) => isMountedRef.current && mergeState({ data: null, pending: false, error })
// 		); // silently initialize the state
// 	}, [...args]);
//
// 	return useMemoObj({ data, pending, error });
// };
//
// useSubscription.initialState = initialSubscriptionState;
//
// let storageListeners = [];
// const syncStorage = (e) => {
// 	for (const setState of storageListeners) setState(e);
// };
//
// let storageEventListenerInitialized = false;
// const initStorageEventListener = () => {
// 	if (!storageEventListenerInitialized) {
// 		window.addEventListener('storage', syncStorage);
// 		storageEventListenerInitialized = true;
// 	}
// };
//
// export const useLocalStoreValue = (key, defaultValue, { setValue, value } = {}) => {
// 	const [val, set] = useState(
// 		() => localStore.getItem(key) || (isFunc(defaultValue) ? defaultValue() : defaultValue)
// 	);
//
// 	const setIt = useCallback(
// 		(value) => {
// 			localStore.setItemDebounced(key, value);
// 			set(value);
// 		},
// 		[key]
// 	);
//
// 	useEffect(() => {
// 		const updateStorage = (e) => {
// 			if (e.storageArea === localStorage && e.key === key) {
// 				const { data } = jsonParse(e.newValue);
// 				set(data || null);
// 			}
// 		};
// 		storageListeners.push(updateStorage);
// 		initStorageEventListener();
// 		return () => storageListeners.splice(storageListeners.indexOf(updateStorage), 1);
// 	}, [key]);
//
// 	return [val, setIt];
// };
//
// export const useEvent = (toOrArrConf, ev, cb, deps = EMPTY_ARRAY) =>
// 	useEffect(() => eventListener(toOrArrConf?.current || toOrArrConf, ev, cb), deps);
//
// export const useHover = () => {
// 	const [hovered, set] = useState(false);
// 	return {
// 		hovered,
// 		bind: {
// 			onMouseEnter: () => set(true),
// 			onMouseLeave: () => set(false)
// 		}
// 	};
// };
//
// export const useFocus = () => {
// 	const [focused, set] = useState(false);
// 	return {
// 		focused,
// 		bind: {
// 			onFocus: () => set(true),
// 			onBlur: () => set(false)
// 		}
// 	};
// };
//
// export const useOnlineStatus = () => {
// 	const [online, set] = useState(navigator.onLine);
// 	useEvent(window, 'online', () => set(true));
// 	useEvent(window, 'offline', () => set(false));
// 	return online;
// };
//
// /*################################
// ##################################
//
//         LISTS, SELECTIONS
//
// ##################################
// ################################*/
//
// export const useSelectionHandler = ({ findById, defaultSelections = [], additionalState } = {}) => {
// 	const [state, mergeState] = useMergeState({ selections: defaultSelections, ...additionalState });
//
// 	const { selections } = state;
//
// 	const isInArray = useMemo(() => createIsInArray({ findById }), [findById]);
//
// 	const getSelections = useCallback(
// 		(items) => {
// 			return getItemsThatExistInBothArrays(selections, items, { findById });
// 		},
// 		[selections, findById]
// 	);
//
// 	const numberOfSelections = useCallback((items) => getSelections(items).length, [getSelections]);
//
// 	const areAllSelected = useCallback(
// 		(items) => {
// 			return numberOfSelections(items) === items.length && items.length !== 0;
// 		},
// 		[numberOfSelections]
// 	);
//
// 	const isIndeterminate = useCallback(
// 		(items) => {
// 			const num = numberOfSelections(items);
// 			return num !== items.length && num !== 0;
// 		},
// 		[numberOfSelections]
// 	);
//
// 	const isSelected = useCallback((item) => isInArray(selections, item), [selections, isInArray]);
//
// 	const toggle = useCallback(
// 		(item) => {
// 			mergeState({ selections: [...toggleSelection(selections, item, { findById })] });
// 			return selections; // ???
// 		},
// 		[mergeState, selections, findById]
// 	);
//
// 	const toggleAll = useCallback(
// 		(items) => {
// 			const allAreSel = areAllSelected(items);
// 			const updated = allAreSel
// 				? excludeItemsFromAray(selections, items, { findById })
// 				: combineArraysAndDeduplicate(selections, items, { findById });
// 			mergeState({ selections: updated });
// 			return updated; // why??
// 		},
// 		[areAllSelected, selections, mergeState]
// 	);
//
// 	const reset = useCallback(() => mergeState({ selection: [] }), [mergeState]);
//
// 	const deps = [
// 		selections,
// 		getSelections,
// 		numberOfSelections,
// 		areAllSelected,
// 		isIndeterminate,
// 		isSelected,
// 		toggle,
// 		toggleAll,
// 		mergeState,
// 		reset,
// 		state
// 	];
//
// 	return useMemo(
// 		() => ({
// 			selections,
// 			getSelections,
// 			numberOfSelections,
// 			areAllSelected,
// 			isIndeterminate,
// 			isSelected,
// 			toggle,
// 			toggleAll,
// 			setSelections: (next) => mergeState({ selections: next }),
// 			mergeState,
// 			reset,
// 			state
// 		}),
// 		deps
// 	);
// };
//
// export const SearchWorkerAdaptor = ({
// 	list = [],
// 	searchOptions,
// 	debounceTime = 50,
// 	searchValue = '',
// 	resultsCallback
// } = {}) => {
// 	let _list, _searchOptions, _debounce, _searchValue, _results, _instance;
//
// 	const init = () => {
// 		_list = [...list];
// 		_searchOptions = { ...searchOptions };
// 		_debounce = debounceTime;
// 		_searchValue = searchValue;
// 		_results = [];
// 	};
//
// 	init();
//
// 	const cancelSearch = () => {
// 		_instance && _instance.cancel();
// 	};
//
// 	const createSearchInstance = () => {
// 		cancelSearch();
// 		_instance = SearchWorker(_list, _searchOptions);
// 	};
//
// 	const debouncedSearch = debounce(async (cb, noResultsCallback) => {
// 		if (!_instance) createSearchInstance();
// 		_results = await _instance(_searchValue);
// 		resultsCallback && !noResultsCallback && resultsCallback(_results);
// 		cb && cb(_results);
// 		return _results;
// 	}, _debounce || 0);
//
// 	const update = async ({
// 		list,
// 		searchOptions,
// 		searchValue,
// 		searchAfterUpdate = true,
// 		noResultsCallback
// 	} = {}) => {
// 		cancelSearch();
// 		if (isArray(list)) _list = _results = list;
// 		if (isObj(searchOptions)) _searchOptions = searchOptions;
// 		if (isString(searchValue)) _searchValue = searchValue;
// 		createSearchInstance();
// 		return searchAfterUpdate && (await new Promise((r) => debouncedSearch(r, noResultsCallback)));
// 	};
//
// 	const search = async (text) => {
// 		_searchValue = text;
// 		return await new Promise((r) => debouncedSearch(r));
// 	};
//
// 	const reset = () => {
// 		cancelSearch();
// 		_list = [];
// 		_searchOptions = {};
// 		_instance = SearchWorker([], {});
// 	};
//
// 	return {
// 		search,
// 		cancelSearch,
// 		update,
// 		reset
// 	};
// };
//
// export const useSearchWorkerSearch = ({ setResults, list = EMPTY_ARRAY, keys, debounce } = {}) => {
// 	const mounted = useIsMounted();
//
// 	const resultsCallback = (res) => mounted.current && setResults && setResults(res);
//
// 	const instance = useMemo(
// 		() =>
// 			SearchWorkerAdaptor({
// 				list: list,
// 				searchOptions: { keys },
// 				resultsCallback,
// 				debounce
// 			}),
// 		[]
// 	);
//
// 	useDidUpdate(() => {
// 		instance.update({ searchOptions: { keys }, list });
// 	}, [keys, list]);
//
// 	useWillUnmount(instance.reset);
//
// 	return instance.search;
// };
//
// export const useSearchWorkerBase = ({ list = EMPTY_ARRAY, keys, debounce } = {}) => {
// 	const [results, setResults] = useState(list);
// 	const search = useSearchWorkerSearch({ setResults, list, keys, debounce });
// 	return { results, search };
// };
//
// export const useSearchWorker = ({ list, keys, debounce, initialSearchValue = '' } = {}) => {
// 	const [value, setSearchValue] = useState(initialSearchValue);
// 	const { results, search } = useSearchWorkerBase({ list, keys, debounce });
//
// 	const setValue = useCallback(
// 		(value) => {
// 			setSearchValue(value);
// 			search(value);
// 		},
// 		[search, setSearchValue]
// 	);
//
// 	const onInput = useCallback(
// 		(e) => {
// 			setValue(e.target.value);
// 		},
// 		[setValue]
// 	);
//
// 	const bind = { onInput, value };
//
// 	return {
// 		bind,
// 		onInput,
// 		value,
// 		setValue,
// 		results
// 	};
// };
//
// export const useSearchWorkerUncontrolledInput = ({ list, keys, debounce } = {}) => {
// 	const { results, search } = useSearchWorkerBase({ list, keys, debounce });
// 	const ref = useUncontrolledInputValue(search);
// 	const bind = { ref };
// 	return { bind, ref, results };
// };
//
// /*################################
// ##################################
//
//             REFS
//
// ##################################
// ################################*/
//
// export const usePrevious = (value) => {
// 	const ref = useRef(value);
// 	useEffect(() => {
// 		ref.current = value;
// 	});
// 	return ref;
// };
//
// export const useUpdatedRef = (value) => {
// 	const v = useRef(value);
// 	v.current = value;
// 	return v;
// };
// export const setRef = (ref, value) => {
// 	if (typeof ref === 'function') {
// 		ref(value);
// 	} else if (ref) {
// 		ref.current = value;
// 	}
// };
//
// export const useForkRef = (refA, refB) => {
// 	/**
// 	 * This will create a new function if the ref props change and are defined.
// 	 * This means react will call the old forkRef with `null` and the new forkRef
// 	 * with the ref. Cleanup naturally emerges from this behavior.
// 	 */
// 	return useMemo(() => {
// 		if (refA == null && refB == null) {
// 			return null;
// 		}
// 		return (refValue) => {
// 			setRef(refA, refValue);
// 			setRef(refB, refValue);
// 		};
// 	}, [refA, refB]);
// };
//
// // export const useIsScrollable = () => {
// //     const [{height, width}, set] = useMergeState({height: false, width: false});
// //     const isMountedRef = useIsMounted();
// // }
//
// /*################################
// ##################################
//
//   SIZING / DIMENSIONS / POSITIONING
//
// ##################################
// ################################*/
//
// export const useIntersection = (
// 	{ disabled, rootMargin = '-150px', eagerTimeout, once, ref },
// 	onChange
// ) => {
// 	const [intersecting, setIntersecting] = useState(() => !!disabled);
// 	const isMountedRef = useIsMounted();
// 	useEffect(() => {
// 		if (disabled) return;
// 		var timeout,
// 			disconnectObserver = () => {
// 				clearTimeout(timeout);
// 				observer && observer.disconnect();
// 				observer = null;
// 			},
// 			observer = new IntersectionObserver(
// 				([{ isIntersecting }]) => {
// 					clearTimeout(timeout);
// 					isIntersecting && once && disconnectObserver();
// 					if (isMountedRef.current) {
// 						setIntersecting(isIntersecting);
// 						onChange && onChange(isIntersecting);
// 					}
// 				},
// 				{ rootMargin }
// 			);
//
// 		ref && ref.current && observer.observe(ref.current);
//
// 		if (eagerTimeout) {
// 			timeout = setTimeout(() => {
// 				disconnectObserver();
// 				if (isMountedRef.current) {
// 					setIntersecting(true);
// 					onChange && onChange(true);
// 				}
// 			}, eagerTimeout);
// 		}
//
// 		return disconnectObserver;
// 	}, [disabled]);
//
// 	return intersecting;
// };
//
// export const useWindowSize = ({ debounce = 166 } = {}) => {
// 	const isMountedRef = useIsMounted();
// 	const [{ width, height }, mergeState] = useMergeState({
// 		height: window.innerHeight,
// 		width: window.innerWidth
// 	});
// 	const handleResize = useCallback(() => {
// 		isMountedRef.current &&
// 			mergeState({
// 				height: window.innerHeight,
// 				width: window.innerWidth
// 			});
// 	}, []);
// 	const debouncedResize = useDebounce(handleResize, debounce);
// 	useEvent(window, 'resize', debouncedResize);
// 	useEffect(debouncedResize, [debouncedResize]);
// 	return { width, height };
// };
//
// const supportMatchMedia = isBrowser && typeof window.matchMedia !== 'undefined';
// const matchMedia = supportMatchMedia ? window.matchMedia : null;
// const getQueries = (screens, breakpoints) =>
// 	screens
// 		.map((width) => {
// 			const w = width.toLowerCase();
// 			const size = w.substring(0, 2),
// 				dir = w.substring(2, w.length);
// 			let q = size in breakpoints.values && (breakpoints[dir] || breakpoints.up)(size);
// 			if (q) {
// 				q = q.replace(/^@media( ?)/m, '');
// 				return [width, q];
// 			}
// 		})
// 		.filter(Boolean);
//
// export const createUseMediaQueriesHook = (themeBreakpoints) => {
// 	return (...screens) => {
// 		let breakpoints = themeBreakpoints;
// 		if (Array.isArray(screens[0])) {
// 			screens = screens[0];
// 			breakpoints = screens[1];
// 		}
//
// 		const mounted = useIsMounted();
// 		const queries = useMemo(() => getQueries(screens, breakpoints), [...screens]);
// 		const [state, merge] = useMergeState(() =>
// 			queries.reduce((acc, [w, q]) => ((acc[w] = matchMedia(q).matches), acc), {})
// 		);
// 		useEnhancedEffect(() => {
// 			const unlisten = [],
// 				initialSet = {};
// 			queries.forEach(([w, q]) => {
// 				const queryList = matchMedia(q);
// 				initialSet[w] = queryList.matches;
// 				const updateMatch = () => mounted.current && merge({ [w]: queryList.matches });
// 				queryList.addListener(updateMatch);
// 				unlisten.push(() => queryList.removeListener(updateMatch));
// 			});
// 			merge(initialSet);
// 			return () => unlisten.forEach((f) => f());
// 		}, [queries]);
// 		return state;
// 	};
// };
