Namespace('ddd.domain.entity.member')
.use('ddd.utils.misc *')
.define(function (ns) {
    var MemberSignature = ns.createSignature(
        ['id', 'created_at', 'updated_at', 'nickname'],
        []
    );

    var Member = ns.defineClass({
        initialize : function (params) {
            _.each(this.__signature__.properties, _.bind(function (p) {
                this[p] = params[p];
            }, this));
        }
    });

    Member.prototype.__signature__ = MemberSignature;

    ns.provide({
        getMember : function (params) {
            return new Member(params);
        },
        MemberSignature : MemberSignature
    });

});