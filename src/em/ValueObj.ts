// This file is part of nbind, copyright (C) 2014-2016 BusFaster Ltd.
// Released under the MIT license, see LICENSE.

// This file handles value objects, which are represented by equivalent C++ and
// JavaScript classes, with toJS and fromJS methods calling each others'
// constructors to marshal the class between languages and providing a similar
// API in both.

import {
	setEvil,
	prepareNamespace,
	defineHidden,
	exportLibrary,
	dep
} from 'emscripten-library-decorator';
import {_nbind as _globals} from './Globals';
import {_nbind as _type} from './BindingType';
import {_nbind as _class} from './BindClass';

// Let decorators run eval in current scope to read function source code.
setEvil((code: string) => eval(code));

const _defineHidden = defineHidden;

export namespace _nbind {
	export var BindType = _type.BindType;
}

export namespace _nbind {

	export var typeTbl: typeof _globals.typeTbl;

	export interface ValueObject {
		fromJS(output: () => void): void;

		/** This is mandatory, but dynamically created inside nbind. */
		__nbindValueConstructor?: _globals.Func;
	}

	export var valueList: ValueObject[] = [];

	export var valueFreeList: number[] = [];

	export function pushValue(value: ValueObject) {
		const num = valueFreeList.pop() || valueList.length;

		valueList[num] = value;
		return(num);
	}

	export function popValue(num: number) {
		const obj = valueList[num];

		valueList[num] = null;
		valueFreeList.push(num);
		return(obj);
	}

	// Special type that constructs a new object.

	export class CreateValueType extends BindType {
		constructor(id: number, name: string) {
			super(id, name);
		}

		makeWireWrite = (expr: string) => '((_nbind.value=new ' + expr + '),0)';
	}

	@prepareNamespace('_nbind')
	export class _ {} // tslint:disable-line:class-name
}

@exportLibrary
class nbind { // tslint:disable-line:class-name

	@dep('_nbind')
	static _nbind_get_value_object(num: number, ptr: number) {
		const obj = _nbind.popValue(num);

		obj.fromJS(function() {
			obj.__nbindValueConstructor.apply(
				this,
				Array.prototype.concat.apply([ptr], arguments)
			);
		});
	}

	@dep('_nbind')
	static nbind_value(name: string, proto: any) {
		Module['NBind'].bind_value(name, proto);

		// Copy value constructor reference from C++ wrapper prototype
		// to equivalent JS prototype.

		_defineHidden(
			(_nbind.typeTbl[name] as _class.BindClass).proto.prototype.__nbindValueConstructor
		)(proto.prototype, '__nbindValueConstructor');
	}

}
