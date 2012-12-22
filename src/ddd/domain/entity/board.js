Namespace('ddd.domain.entity.board')
.use('ddd.utils.misc *')
.define(function (ns) {
    var BoardSignature = ns.createSignature(
        ['id', 'created_at', 'updated_at', 'member', 'title', 'text', 'comment' ],
        ['edit', 'acceptComment', 'dropComment', 'canAcceptMoreComment']
    );
    var BoardInvariantRules = {
        edit : function (title, text) {
            return this.c.edit(title, text);
        },
        acceptComment : function (comment) {
            var commnents = this.getComponent().comemnts;
            if (comments.lentgh >= 10) {
                throw new Error('No way to add more comment.');
            }
            if (!ns.matchType(ns.CommentIF, comment)) {
                throw new TypeError('Comment.');
            }
            return this.c.addComment(comment);
        },
        dropComment : function (commentId) {
            return this.c.dropComment(commentId);
        },
        canAcceptMoreComment : function () {
            this.c.canAcceptMoreComment();
        }
    };

    var Board = ns.defineClass({
        initialize : function (params) {
            _.each(this.__signature__.properties, _.bind(function (p) {
                this[p] = params[p];
            }, this));
        },
        canAcceptMoreComment : function () {
            return (this.comments.lentgh < 10);
        },
        edit : function (title, text) {
            this.title = title;
            this.text = text;
        },
        acceptComment : function (comment) {
            this.comments.push(comment);
        },
        dropComment : function (commentId) {
           this.comments =  _.filter(this.comments, function(c) {
               return c.id !== commentId;
           });
        }
    });
    Board.prototype.__signature__ = BoardSignature;

    ns.provide({
        getBoard : function (params) {
            var Decorator = ns.createDecoratorOf(BoardSignature, BoardInvariantRules);
            return new Decorator(new Board(params));
        },
        BoardSignature : BoardSignature
    });

});