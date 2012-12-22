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