Namespace('ddd.domain.factory.board')
.use('ddd.domain.entity.board Board,BoardIF')
.use('ddd.domain.entity.member MemberIF')
.use('ddd.domain.valueobject.timestamp TimestampIF')
.use('ddd.utils.misc defineClass,matchType,getSupposedUniqueId')
.define(function (ns) {

    var instanceAsSingleton = null;

    var BoardFactory = ns.defineClass({
        initialize : function () {
        },
        create : function (member, title, text) {
            var initializeParams = {
                id : ns.getSupposedUniqueId(),
                created_at : new ns.Timestamp(),
                updated_at : undefined,
                member : member,
                title : title,
                text : text,
                comments : []
            };

            return new ns.Board(initializeParams);
        }
    });

    ns.provide({
        getBoardFactory : function () {
            if ( !instanceAsSingleton ) {
                instanceAsSingleton = new BoardFactory();
            }
            return instanceAsSingleton;
        }
    });

});