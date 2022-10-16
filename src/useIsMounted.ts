import { useRef, useEffect, useCallback } from 'react';

/**
 * returns a function for retrieving the mounted state of the component
 * @returns () => boolean // true if mounted
 * @example
 * 	const isMounted = useIsMounted();
 * 	useEffect(()=>{
 * 	    console.log(isMounted()); // true
 * 	},[]);
 */
export const useIsMounted = (): (() => boolean) => {
	const isMounted = useRef<boolean>(false);
	useEffect(() => {
		isMounted.current = true;
		return () => {
			isMounted.current = false;
		};
	}, []);
	return useCallback(() => isMounted.current, []);
};
