Namespace('ddd.ui.boardlist')
.use('ddd.utils.misc *')
.use('ddd.application.boardservice *')
.define(function (ns) {

    var boardListDidLoad = function (data) {
        var boardList = _.map(data, function (e) {
            return {
                id : e.id,
                title : e.title,
                text : e.text,
                created_at : new Date(e.created_at),
                memberId : e.member.id,
                nickname : e.member.nickname
            };
        });

        var template = ns.getTemplate('HTML_TEMPLATE_BOARDLIST');
        template.param({
            boardList : boardList
        });
        this.element.innerHTML = template.output();
    };

    var BoardList = ns.defineClass({
        initialize : function (e, d) {
            this.element = e;
            this.dataset = d;

            ns.getBoardService(undefined)
                    .observeFindBoardList(_.bind(boardListDidLoad, this));
            ns.getBoardService(undefined)
                    .observePostNewBoard(_.bind(boardListDidLoad, this));
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