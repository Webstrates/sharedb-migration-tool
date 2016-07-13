var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;

var DATABASE_NAME = "webstrate";
var COLLECTION_NAME = "webstrates";

var url = "mongodb://localhost:27017/" + DATABASE_NAME;

// ShareDB adds a `_o` (opLink) property to each document, which is not present on (unmigrated) ShareJS documents.
var SHAREJS_SELECT_QUERY = { _o : { $exists: false } };

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
};

MongoClient.connect(url, function(err, db) {
	var coll = {
		main: db.collection(COLLECTION_NAME), // Main document collection
		oldOps: db.collection(COLLECTION_NAME + '_ops'), // Ops collection with ShareJS (old)
		newOps: db.collection('o_' + COLLECTION_NAME) // Ops collection with ShareDB (new)
	};

	coll.main.find(SHAREJS_SELECT_QUERY).count(function(err, count) {
		var progressCount = 0, totalCount = count;

		if (totalCount === 0) {
			console.log("Nothing to migrate.");
			db.close();
			return;
		}

		console.log("Migrating", totalCount, "webstrates.");

		var webstratesCursor = coll.main.find(SHAREJS_SELECT_QUERY);

		var processNextWebstrate = function() {
			webstratesCursor.hasNext(function(err, hasNext) {
				if (err) throw err;
				if (hasNext) {
					progressCount++;
					process.stdout.cursorTo(0);
					process.stdout.write("Progress: " + (progressCount/totalCount * 100).toFixed(2) + "%. ");
					webstratesCursor.next(function(err, webstrate) {
						if (err) throw err;
						var opsCursor = coll.oldOps.find({ name: webstrate._id }, { sort: "v" });
						coll.newOps.remove({ d: webstrate._id }, function(err) {
							if (err) throw err;
							processNextOp(opsCursor, webstrate, null);
						});
					});
				} else {
					console.log("\nMigration successful.");
					db.close();
				}
			});
		};

		var processNextOp = function(opsCursor, webstrate, opLink) {
			opsCursor.hasNext(function(err, hasNext) {
				if (err) throw err;
				if (hasNext) {
					opsCursor.next(function(err, op) {
						var id = new ObjectId();
						var newOp = {
							_id: id,
							op: replaceDots(op.op),
							v: op.v,
							d: op.name,
							src: op.src,
							seq: op.seq,
							m: { ts: op.m.ts },
							o: opLink
						};
						if (op.create) {
							newOp.create = op.create;
						}
						opLink = id;
						coll.newOps.insert(newOp, function(err) {
							if (err) {
								console.log("Unable to migrate:", webstrate._id, "(" + err + ")");
								console.log(op._id);
								processNextWebstrate();
							} else {
								processNextOp(opsCursor, webstrate, opLink);
							}
						});
					});
				}
				else {
					coll.main.update({ _id: webstrate._id }, { $set: { _o: opLink}}, function(err) {
						if (err) {
							console.log("Error with webstrate", webstrate);
							throw err;
						}
						processNextWebstrate();
					});
				}
			});
		};

		processNextWebstrate();
	});
});
