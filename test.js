var doc = {
	"hello": [
		"foo.bar",
		"quux",
		{
			"qu.ux": null,
			"b.a.z": "b.a.z"
		}
	],
	"hel.lo": [],
	"quux.quux": {
		"this": "that.",
		"baz.": [1,2,3]
	},
	"nothing": null,
	"noth.ing": "noth.ing"
};

var docExpected = {
	"hello": [
		"foo.bar",
		"quux",
		{
			"qu__ux": null,
			"b__a__z": "b.a.z"
		}],
	"hel__lo": [],
	"quux__quux": {
		"this": "that.",
		"baz__": [1,2,3]
	},
	"nothing": null,
	"noth__ing": "noth.ing"
};

var replaceDots = function(obj) {
	if (!obj) {
		return obj;
	}

	if (Array.isArray(obj)) {
		obj.map(function(el) {
			return replaceDots(el);
		});
		return obj;
	}

	if (typeof obj === "object") {
		Object.keys(obj).forEach(function(key) {
			var newValue = replaceDots(obj[key]);
			var newKey = key.replace(/\./g, "__");
			delete obj[key];
			obj[newKey] = newValue;
		});
	}

	return obj;
}

console.log("Test", JSON.stringify(replaceDots(doc)) === JSON.stringify(docExpected) ? "passed" : "failed");