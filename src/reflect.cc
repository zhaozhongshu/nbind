// This file is part of nbind, copyright (C) 2014-2016 BusFaster Ltd.
// Released under the MIT license, see LICENSE.

#include "nbind/nbind.h"

using namespace nbind;

void NBind :: reflect(
	cbFunction &outClass,
	cbFunction &outMethod
) {

	// Output all classes before any functions or methods,
	// so they'll have class type IDs available.

	for(auto *bindClass : getClassList()) {
		if(bindClass->isDuplicate()) continue;

		const TYPEID *types = bindClass->getTypes();

		printf("%lld %lld %lld\n", reinterpret_cast<uint64_t>(types[0]), reinterpret_cast<uint64_t>(types[1]), reinterpret_cast<uint64_t>(types[2]));

		outClass(
			reinterpret_cast<uint64_t>(types[0]),
			reinterpret_cast<uint64_t>(types[1]),
			reinterpret_cast<uint64_t>(types[2]),
			bindClass->getName()
		);
	}

	outClass(
		-1LL,
		0x4000000000000000LL,
		-0x4000000000000000LL,
		"test"
	);

	outClass(
		0x8000000000000000ULL,
		0x8000000000000000LL,
		-0x8000000000000000LL,
		"test"
	);

	outClass(
		0x7fffffffffffffffULL,
		0x7fffffffffffffffLL,
		-0x7fffffffffffffffLL,
		"test"
	);

	for(auto &func : getFunctionList()) {
	}
}
