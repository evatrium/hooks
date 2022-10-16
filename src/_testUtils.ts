export const createProfile = () => ({
	id: 2,
	name: { fist: 'Dolores', last: 'Abernathy' },
	is_robot: true,
	permissions: {
		is_owner: false
	},
	favorite_movies: ['ex machina'],
	team: {
		owners: [
			{ id: 1, name: { first: 'Robert', last: 'Ford' } },
			{ id: 3, name: { first: 'Bernard', last: 'Lowe' } }
		],
		members: [{ id: 4, name: { first: 'Teddy', last: 'Flood' } }]
	}
});

class Classy {
	constructor(public foo: string) {}
}

const func = () => 0;

// @ts-ignore
export const createSerializableData = (nested?: boolean) => ({
	null: null,
	string: 'foobar',
	number: 1,
	negNum: -1,
	zero: 0,
	boolean: true,
	array: ['a', 'b', 'c', nested && createSerializableData()].filter(Boolean),
	object: {
		foo: 'bar',
		...(nested && { nested: createSerializableData() })
	}
});

// @ts-ignore
export const createData = (nested?: boolean) => {
	return {
		...createSerializableData(),
		...(nested && {
			nested1: createData(),
			nested2: createSerializableData(nested)
		}),
		undefined: undefined,
		date: new Date('2022-10-01'),
		map: new Map([
			[1, 'one'],
			[2, 'two'],
			[3, 'three']
		]),
		set: new Set([1, 2])
	};
};

// @ts-ignore
export const createDataManyTypes = (nested?: boolean) => {
	return {
		symbol: Symbol('foobar'),
		NaN: NaN,
		func,
		classInstance: new Classy('fancy'),
		regexp: new RegExp('[a-z]'),
		promise: new Promise(() => 0),
		blob: new Blob(),
		...createData(),
		...(nested && {
			nested1: createDataManyTypes(),
			nested2: createData(nested)
		})
	};
};

export const serializableDataNestedResult = {
	null: null,
	string: 'foobar',
	number: 1,
	negNum: -1,
	zero: 0,
	boolean: true,
	array: [
		'a',
		'b',
		'c',
		{
			null: null,
			string: 'foobar',
			number: 1,
			negNum: -1,
			zero: 0,
			boolean: true,
			array: ['a', 'b', 'c'],
			object: { foo: 'bar' }
		}
	],
	object: {
		foo: 'bar',
		nested: {
			null: null,
			string: 'foobar',
			number: 1,
			negNum: -1,
			zero: 0,
			boolean: true,
			array: ['a', 'b', 'c'],
			object: { foo: 'bar' }
		}
	}
};
