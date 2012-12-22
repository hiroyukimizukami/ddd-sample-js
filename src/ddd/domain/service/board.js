Namespace('ddd.domain.service.board')
.use('ddd.utils.misc *')
.use('ddd.domain.entity.board *')
.use('ddd.domain.repository.board *')
.use('ddd.domain.repository.member *')
.define(function (ns) {
    var instanceAsSingleton = null;

    var Signature = ns.createSignature(
        [],
        [
            'postNewBoard', 'updateBoard', 'dropBoard', 'findBoardList',
            'observePostNewBoard', 'observeUpdateBoard',
            'observeDropBoard', 'observeFindBoardList'
        ]
    );
    var DomainValidator = ns.createDecoratorOf(Signature, {
        postNewBoard : function (params) {
            var member = this.getComponent().memberRepository.lookup(params.memberId);
            if (!member) {
                throw new Error('Membre does not exist.');
            }

            return this.c.postNewBoard(params);
        },
        updateBoard : function (params) {
            var member = this.getComponent().memberRepository.lookup(params.memberId);
            if (!member) {
                throw new Error('Member does not exist.');
            }
            var target = this.getComponent().boardRepository.lookup(params.boardId);
            if (!board) {
                throw new Error('Board does not exist.');
            }

            if (params.memberId !== target.member.id) {
                throw new Error('Forbidden such performing.');
            }

            return this.c.updateBoard(params);
        },
        dropBoard : function (params) {
            var member = this.getComponent().memberRepository.lookup(params.memberId);
            if (!member) {
                throw new Error('Member does not exist.');
            }
            var target = this.getComponent().boardRepository.lookup(params.boardId);
            if (!board) {
                throw new Error('Board does not exist.');
            }

            if (params.memberId !== target.member.id) {
                throw new Error('Forbidden such performing.');
            }

            return this.c.dropBoard(params);
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
        initialize : function (b, m) {
            this.stateChangeObservers = {
                postNewBoard : [],
                findBoardList : [],
                dropBoard : [],
                updateBoard : []
            };
            this.boardRepository = ns.getBoardRepositoryWithIF(b);
            this.memberRepository = ns.getMemberRepositoryWithIF(m);
        },
        postNewBoard : function (params) {
            var member = this.memberRepository.lookup(params.memberId);
            var board = ns.getBoard(params);
            board.member = member;

            this.notifyTo(
                this.stateChangeObservers.postNewBoard,
                this.boardRepository.add(board)
            );

        },
        updateBoard : function (params) {
            var board = this.boardRepository.lookup(params.boardId);
            board.title = params.title;
            board.text = params.text;

            this.notifyTo(
                this.stateChangeObservers.updateBoard,
                this.boardRepository.update(board)
            );
        },
        dropBoard : function (params) {
            this.notifyTo(
                this.stateChangeObservers.dropBoard,
                this.boardRepository.drop(params.boarId)
            );
        },
        findBoardList : function (params) {
            this.notifyTo(
                this.stateChangeObservers.findBoardList,
                this.boardRepository.find()
            );
        },
        observePostNewBoard : function (f) {
            this.stateChangeObservers.postNewBoard.push(f);
        },
        observeUpdateBoard : function (f) {
            this.stateChangeObservers.updateBoard.push(f);
        },
        observeDropBoard : function (f) {
            this.stateChangeObservers.dropBoard.push(f);
        },
        observeFindBoardList : function (f) {
            this.stateChangeObservers.findBoardList.push(f);
        },
        notifyTo : function(observers, data) {
            if (!observers) {
                return ;
            }

            _.each(observers, function (f) {
                ns.tryCatch(function () {
                    f(ns.toPlainObject(data));
                });
            });
        }
    });

    ns.provide({
        getBoardService : function (boardRepository, memberRepository) {
            if (!instanceAsSingleton) {
                instanceAsSingleton = new DomainValidator(
                    new BoardService(boardRepository, memberRepository));
            }
            return instanceAsSingleton;
        }
    });
});