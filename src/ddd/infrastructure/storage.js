Namespace('ddd.infrastructure.storage')
.use('ddd.utils.misc *')
.define(function (ns) {
    var instanceAsSingleton = null;
    var MyStorage  = ns.defineClass({
        initialize : function () {
        },
        save : function (id, plainObject) {
            var current = this.load(id);
            if (current && (current.updated_at > plainObject.updated_at)) {
                throw new Error('Fail to update for concurrency problem, object is not fast forward.');
            }

            window.localStorage[id.toString()] = JSON.stringify(plainObject);
        },
        drop : function (id) {
            window.localStorage[id] = undefined;
        },
        load : function (id) {
            var jsonStringOrUndef = window.localStorage[id];
            if (jsonStringOrUndef) {
                return JSON.parse(jsonStringOrUndef);
            }
            return undefined;
        },
        clear : function () {
            window.localStorage.clear();
        }

    });

    ns.provide({
        getStorage : function () {
            if (!instanceAsSingleton) {
                instanceAsSingleton = new MyStorage();
            }
            return instanceAsSingleton;
        }
    });
});