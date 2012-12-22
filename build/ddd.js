Namespace('ddd.ui.login')
.use('ddd.utils.misc *')
.define(function (ns) {
    var Login = ns.defineClass({
        initialize : function (e, d) {
            this.element = e;
            this.dataset = d;

            //Mock login
            $(this.element).bind('click', function (e) {
                alert('Loged-in');
                window.performerId = '001';
            });
        }
    });

    ns.provide({
        registerElement : function (e, d) {
            new Login(e, d);
        }
    });
});
Namespace('ddd.ui.createnewboard')
.use('brook.channel *')
.use('ddd.utils.misc *')
.use('ddd.application.boardservice *')
.define(function (ns) {

    var createBoard = function (e) {
        var title = $(this.element).find('#boardCreate-title').val();
        var text = $(this.element).find('#boardCreate-text').val();

        var params = {
            title : title,
            text : text,
            performerId : window.performerId
        };

        var errorHandler = function (err) {
            window.alert(err.message);
        }

        ns.tryCatch(
            function () {
                ns.getBoardService().postNewBoard(params);
            }, errorHandler);
    };

    var CreateNewBoardButton = ns.defineClass({
        initialize : function (e, d) {
            this.element = e;
            this.dataset = d;

            var template =  ns.getTemplate('HTML_TEMPLATE_NEWBOARDFORM');
            $(this.element).html(template.output());


            $(this.element).find('#boardCreate-submitbutton')
                    .bind('click', _.bind(createBoard, this));
        }
    });

    ns.provide({
        registerElement : function (element, dataset) {
            new CreateNewBoardButton(element, dataset);
        }
    });
});
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

    var tryCatch = function _tryCatch(f, handler) {
        var h = handler;
        if (!h) {
            h = function () {};
        }
        try {
            f();
        } catch (x) {
            h(x);
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
 Namespace('ddd.domain.repository.board')
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
        getBoardRepositoryWithIF : function (repository) {
            return new RespositoryForInterface(repository);
        }
    });
});
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
Namespace('ddd.domain.entity.board.comment')
.define(function (ns) {

    ns.provide({});
});
Namespace('ddd.infrastructure.repository.member')
.use('ddd.utils.misc *')
.use('ddd.infrastructure.storage getStorage')
.use('ddd.domain.entity.member *')
.define(function (ns) {

    var INDEX_KEY = 'MEMBER_REPOSITORY_LIST';
    var storage = ns.getStorage();
    var repository = {};
    var instanceAsSingleton = null;

    var updateIndex =  function () {
        var ids = _.chain(repository)
                .filter(function(e) {
                    return e.id;
                }).map(function (e) {
                    return e.id;
                }).value();
        storage.save(INDEX_KEY, ids);
    };

    var MemberRepositoryImpl = ns.defineClass({
        initialize : function () {
        },
        add : function (member) {
            if (!ns.matchType(ns.MemberSignature, member)) {
                throw new TypeError('');
            }
            if (repository[member.id]) {
                throw new Error('Duplicate entry.');
            }

            member.id = ns.getSupposedUniqueId();
            member.created_at = (new Date().getTime());
            member.updated_at = undefined;

            storage.save(member.id, ns.toPlainObject(member));
            repository[member.id] = member;
            updateIndex();

            return member;
        },
        drop : function (id) {
            var boaed = repository[id];
            if (member) {
                storage.drop(id);
                delete repository[id];
                updateIndex();
            }
        },
        find : function () {
            var that = this;
            var ids = storage.load(INDEX_KEY);

            if (!ids) {
                return [];
            }
            return _.chain(ids).map(function (id) {
                return that.lookup(id);
            }).value();

        },
        lookup : function (id) {
            var member = repository[id];
            if (member) {
                return member;
            }

            var plainObject = storage.load(id);
            if (plainObject) {
                var entity = ns.getMember(plainObject);
                repository[entity.id] = entity;
                return entity;
            }

            return undefined;
        },
        update : function (member) {
            if (!ns.matchType(ns.MemberSignature, member)) {
                throw new TypeError('Object is not proper type');
            }
            if (!repository[member.id]) {
                throw new Error('Nonexsitent entry.');
            }

            member.updated_at = (new Date().getTime());
            storage.save(member.id, ns.toPlainObject(member));
            repository[member.id] = member;

            return member;
        },

    });

//Creating Default member
try {
    var obj = ns.getMember({
        id : '001',
        nickname : 'DDDMan',
        created_at : +(new Date()),
        updated_at : undefined
    });
    storage.save(obj.id, ns.toPlainObject(obj));
    repository[obj.id] = obj;
    updateIndex();
} catch (x) {
    
}

    ns.provide({
        getMemberRepository : function () {
            if (!instanceAsSingleton) {
                instanceAsSingleton = new MemberRepositoryImpl();
            }
            return instanceAsSingleton;
        }
    });
});
Namespace('ddd.infrastructure.repository.board')
.use('ddd.utils.misc *')
.use('ddd.infrastructure.storage getStorage')
.use('ddd.infrastructure.repository.member *')
.use('ddd.domain.entity.board *')
.define(function (ns) {

    var INDEX_KEY = 'BOARD_REPOSITORY_LIST';
    var storage = ns.getStorage();
    var repository = {};
    var instanceAsSingleton = null;


    var updateIndex =  function () {
        var ids = _.chain(repository)
                .filter(function(e) {
                    return e.id;
                }).map(function (e) {
                    return e.id;
                }).value();
        storage.save(INDEX_KEY, ids);
    };

    var BoardRepositoryImpl = ns.defineClass({
        initialize : function () {
        },
        add : function (board) {
            if (!ns.matchType(ns.BoardSignature, board)) {
                throw new TypeError('');
            }
            if (repository[board.id]) {
                throw new Error('Duplicate entry.');
            }

            board.id = ns.getSupposedUniqueId();
            board.created_at = (new Date().getTime());
            board.updated_at = undefined;

            var object = ns.toPlainObject(board);
            object.member = object.member.id;

            storage.save(board.id, object);
            repository[board.id] = board;
            updateIndex();

            return board;
        },
        drop : function (id) {
            var boaed = repository[id];
            if (board) {
                storage.drop(id);
                delete repository[id];
                updateIndex();
            }
        },
        find : function () {
            var that = this;
            var ids = storage.load(INDEX_KEY);

            if (!ids) {
                return [];
            }
            return _.chain(ids).map(function (id) {
                return that.lookup(id);
            }).value();

        },
        lookup : function (id) {
            var board = repository[id];
            if (board) {
                return board;
            }

            var plainObject = storage.load(id);
            if (plainObject) {
                plainObject.member = ns.getMemberRepository().lookup(plainObject.member);
                var entity = ns.getBoard(plainObject);
                repository[entity.id] = entity;
                return entity;
            }

            return undefined;
        },
        update : function (board) {
            if (!ns.matchType(ns.BoardSignature, board)) {
                throw new TypeError('');
            }
            if (!repository[board.id]) {
                throw new Error('Nonexsitent entry.');
            }

            board.updated_at = (new Date().getTime());
            storage.save(board.id, ns.toPlainObject(board));
            repository[board.id] = board;

            return board;
        },

    });

    ns.provide({
        getBoardRepository : function () {
            if (!instanceAsSingleton) {
                instanceAsSingleton = new BoardRepositoryImpl();
            }
            return instanceAsSingleton;
        }
    });
});
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