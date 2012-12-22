 Namespace('ddd.domain.repository.member')
.use('ddd.utils.misc *')
.define(function (ns) {
    var RespositoryForInterface = ns.defineClass({
        initialize : function (r) {
            this.r = r;
        },
        add : function () {
            var args = Array.prototype.slice.call(arguments);
            return this.r.add.apply(this.r, args);
        },
        drop : function () {
            var args = Array.prototype.slice.call(arguments);
            return this.r.drop.apply(this.r, args);
        },
        update: function () {
            var args = Array.prototype.slice.call(arguments);
            return this.r.update.apply(this.r, args);
        },
        find : function () {
            var args = Array.prototype.slice.call(arguments);
            return this.r.find.apply(this.r, args);
        },
        lookup : function () {
            var args = Array.prototype.slice.call(arguments);
            return this.r.lookup.apply(this.r, args);
        }
    });

    ns.provide({
        getMemberRepositoryWithIF : function (repository) {
            return new RespositoryForInterface(repository);
        }
    });
});