Namespace('ddd.utils.misc')
.use('brook.view.htmltemplate HTMLTemplate')
.define(function (ns) {
    var defineClass = function _defineClass(o, sig) {
        var f = function () {
            this.initialize.apply(this, arguments);
        };
        _.chain(o).keys().each(function (e) {
            f.prototype[e] = o[e];
        });
        if (typeof f.prototype.initialize !== 'function') {
            f.prototype.initialize = function () {};
        }
        f.prototype.constructor = f;

        if (sig) {
            f.__signature__ = sig;
        }

        return f;
    }

    var isEmptyString = function _isEmptyString(s) {
        if (!s) {
            return true;
        }
        if (s.trim() === '') {
            return true;
        }
        return false;
    }

    var getWhiteListChecker = function _getWhiteslitValidator(whitelist) {
        if (!_.isArray(whitelist)) {
            throw new TypeError('non-array is assigned');
        }
        return function (target) {
            if (!(_.isObject(target))) {
                throw new TypeError('non-object');
            }

            if (whitelist.length !== _.keys(target).length) {
                return false;
            }
            var keysOk = _.every(whitelist, function (key) {
                return target[key];
            });
            return keysOk;
        };
    };

    var fitLengthInto = function _fitLengthInto(minimum, maximum) {
        return function (i) {
            if (i < minimum) {
                return false;
            }
            if (i > maximum) {
                return false;
            }
            return true;
        };
    }

    var matchType= function _matchType(sig, object) {
        return _.every(sig.methods, function (e) {
            return object[e] ? true : false;
        });
    }

    //Without contention detection
    var getSupposedUniqueId = function _getSupposedUniqueId() {
        var epoch = (new Date().getTime()).toString();
        var random = Math.floor(Math.random() * 1024).toString();
        return epoch + random;
    }

    var createDecoratorOf = function _createDecoratorOf(sig, impl) {
        var methods = {};
        methods.initialize = function (c) {
            this.c = c;
            _.each(sig.properties, _.bind(function (e) {
                var p;
                if (c.getComponent && typeof c.getComponent === 'function') {
                    p = c.getComponent();
                }
                if (!p) {
                    p = c[e];
                }
                this[e] = p;
            }, this));
        };
        methods.getComponent = function () {
            if (this.c.getComponent && typeof this.c.getComponent === 'function')  {
                return this.c.getComponent();
            }
            return this.c;
        }

        _.each(sig.methods, function (e) {
            methods[e] = impl[e];
        });

        var klass = defineClass(methods);
        klass.prototype.__signature__ = sig;
        return klass;
    };

    var createSignature = function _createSignature(properties, methods) {
        if (!_.isArray(properties)) {
            throw new TypeError('Properties must be array.');
        }
        if (!_.isArray(methods)) {
            throw new TypeError('Methods must be array.');
        }
        return {
            properties : properties,
            methods : methods
        };
    };

    var toPlainObject = function _toPlainObject(entities) {
        var object = {};
        if (_.isArray(entities)) {
            return _.map(entities, function (e) {
                return _toPlainObject(e);
            });
        }
        _.each(entities.__signature__.properties, function (e) {
            if (entities[e] && entities[e].__signature__) {
                object[e] = _toPlainObject(entities[e]);
            } else {
                object[e] = entities[e];
            }
        });
        return object;
    }

    var tryCatch = function _tryCatch(f) {
        try {
            f();
        } catch (x) {
            console.log(x.stack);
        }
    }

    var getTemplate = function _getTemplate(id) {
        var h = ns.HTMLTemplate;
        h.registerFunction('escape', _.string.escapeHTML);
        return h.getByElementId(id);
    };

    var formatDate = function _formatDate(date) {
        if (!date) {
            return date;
        }
        var yyyy = date.getFullYear();
        var mm = date.getMonth();
        var dd = date.getDate();
        var hh = date.getHours();
        var mi = date.getMinutes();
        var sec = date.getSeconds();
        return yyyy + '/' + mm + '/' + dd + ' ' + hh + ':' + mi + ":" + sec;
    }

    ns.provide({
        defineClass : defineClass,
        isEmptyString : isEmptyString,
        fitLengthInto : fitLengthInto,
        matchType : matchType,
        getSupposedUniqueId : getSupposedUniqueId,
        createDecoratorOf : createDecoratorOf,
        createSignature : createSignature,
        toPlainObject : toPlainObject,
        getWhiteListChecker : getWhiteListChecker,
        tryCatch : tryCatch,
        getTemplate : getTemplate,
        formatDate : formatDate
    });
});