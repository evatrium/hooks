// export type ObjOrArrType = Record<string | number, any> | Array<any>;

export type Obj = { [key: string | number]: any };
export type ObjArr = Obj[];

export type ObjOrArrType =
	| Obj
	| Array<any>
	| ObjOrArrType[]
	| ObjArr
	| { [key: string | number]: ObjOrArrType };

export type PrimitiveType = null | undefined | string | number | boolean | symbol | bigint;

/** A parsed/serializable JSON value. */
// Exclude<PrimitiveType, symbol | bigint>
export type JsonLikeType =
	| string
	| number
	| boolean
	| null
	| JsonLikeType[]
	| { [key: string | number]: JsonLikeType };

export type EmitsEvents = Window | Document | HTMLElement | EventTarget;
