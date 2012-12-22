Namespace('ddd.ui.boardlist')
.use('ddd.utils.misc *')
.use('ddd.application.boardservice *')
.define(function (ns) {

    var boardListDidLoad = function (data) {
        var boardList = _.chain(data)
        .sortBy(function(e) {
            return e.creted_at;
        }).map(function (e) {
            return {
                id : e.id,
                title : e.title,
                text : e.text,
                created_at : ns.formatDate(new Date(e.created_at)),
                memberId : e.member.id,
                nickname : e.member.nickname
            };
        }).value().reverse();
        if (_.isEmpty(boardList)) {
            boardList = null;
        }

        var template = ns.getTemplate('HTML_TEMPLATE_BOARDLIST');
        template.param({
            boardList : boardList
        });
        this.element.innerHTML = template.output();
    };
    var boardDidAdded = function (data) {
        var template = ns.getTemplate('HTML_TEMPLATE_BOARD');
        template.param({
            id : data.id,
            title : data.title,
            text : data.text,
            created_at : ns.formatDate(new Date(data.created_at)),
            memberId : data.member.id,
            nickname : data.member.nickname
        });
        $(this.element).find('.JS_boardList').prepend(template.output());
    };

    var BoardList = ns.defineClass({
        initialize : function (e, d) {
            this.element = e;
            this.dataset = d;

            ns.getBoardService(undefined)
                    .observeFindBoardList(_.bind(boardListDidLoad, this));
            ns.getBoardService(undefined)
                    .observePostNewBoard(_.bind(boardDidAdded, this));
            ns.getBoardService(undefined)
                    .observeDropBoard(_.bind(boardListDidLoad, this));

            ns.tryCatch(_.bind(this.load, this));
        },
        load : function () {
            ns.getBoardService(undefined).getBoardList({});
        }
    });
    ns.provide({
        registerElement : function (e, d)  {
            new BoardList(e, d);
        }
    });
});