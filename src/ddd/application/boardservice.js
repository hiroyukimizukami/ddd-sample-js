Namespace('ddd.application.boardservice')
.use('ddd.utils.misc *')
.use('ddd.infrastructure.repository.board *')
.use('ddd.infrastructure.repository.member *')
.use('ddd.domain.entity.board *')
.use('ddd.domain.service.board *')
.define(function(ns) {
    var instanceAsSingleton = null;

    var Signature = ns.createSignature(
        [],
        [
            'postNewBoard', 'updateBoard', 'dropBoard', 'getBoardList',
            'observePostNewBoard', 'observeUpdateBoard',
            'observeDropBoard', 'observeFindBoardList'
        ]
    );

    var ApplicationValidator = ns.createDecoratorOf(Signature, {
        postNewBoard : function (params) {
            var checkerForMandatory = ns.getWhiteListChecker(
                ['title', 'text', 'performerId']
            );
            if (!checkerForMandatory(params)) {
                throw new Error('Missing mandatory parameters');
            }
            if (!ns.fitLengthInto(1, 30)(params.title)) {
                throw new Error('Title length is out of range.');
            }
            if (!ns.fitLengthInto(1, 100)(params.text)) {
                throw new Error('Text length is out of range.');
            }

            return this.c.postNewBoard(params);
        },
        updateBoard : function (params) {
            var checkerForMandatory = ns.getWhiteListChecker(
                ['title', 'text', 'performerId']
            );
            if (!checkerForMandatory(params)) {
                throw new Error('Missing mandatory parameters');
            }
            if (!ns.fitLengthInto(1, 30)(params.title)) {
                throw new Error('Title length is out of range.');
            }
            if (!ns.fitLengthInto(1, 100)(params.text)) {
                throw new Error('Text length is out of range.');
            }

            return this.c.updateBoard(params);
        },
        dropBoard : function (params) {
            return this.c.dropBoard(params);
        },
        getBoardList : function (params) {
            return this.c.getBoardList(params);
        },
        findBoardList : function (params) {
            return this.c.findBoardList(params);
        },
        observePostNewBoard : function (f) {
            return this.c.observePostNewBoard(f);
        },
        observeUpdateBoard : function (f) {
            return this.c.observeUpdateBoard(f);
        },
        observeDropBoard : function (f) {
            return this.c.observeDropBoard(f);
        },
        observeFindBoardList : function (f) {
            return this.c.observeFindBoardList(f);
        },
    });

    var BoardService = ns.defineClass({
        initialize : function () {
            var boardRepository = ns.getBoardRepository();
            var memberRepository = ns.getMemberRepository();
            this.domainService = ns.getBoardService(boardRepository, memberRepository);
        },
        postNewBoard : function (params) {
            var args = {
                title : params.title,
                text : params.text,
                memberId : params.performerId
            };
            this.domainService.postNewBoard(args);
        },
        updateBoard : function (params) {
            var args = {
                title : params.title,
                text : params.text,
                memberId : params.performerId
            };
            this.domainService.updateBoard(args);
        },
        dropBoard : function (params) {
            var args = {
                boardId : boardId,
                memberId : params.performerId
            };
            this.domainService.dropBoard(args);
        },
        getBoardList : function (params) {
            var args = {};
            this.domainService.findBoardList(args);
        },
        observePostNewBoard : function (f) {
            this.domainService.observePostNewBoard(f);
        },
        observeUpdateBoard : function (f) {
            this.domainService.observeUpdateBoard(f);
        },
        observeDropBoard : function (f) {
            this.domainService.observeDropBoard(f);
        },
        observeFindBoardList : function (f) {
            this.domainService.observeFindBoardList(f);
        },
    });

    ns.provide({
        getBoardService : function () {
            if (!instanceAsSingleton) {
                instanceAsSingleton  = new ApplicationValidator(new BoardService());
            }
            return instanceAsSingleton;
        }
    });
});