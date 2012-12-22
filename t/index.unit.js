var livesOk = function (label, f) {
    try {
        f();
        ok(true, label);
    } catch (x) {
        console.log(x);
        ok(false, label);
    }
};
var diesOk = function (label, f) {
    try {
        f();
        ok(false, label);
    } catch (x) {
        console.log(x);
        ok(true, label);
    }
};

var emptyFunc = function () {};

test('ddd.utils', function () {
    Namespace()
   .use('ddd.utils.misc *')
   .apply(function (ns) {
        livesOk('defineClass', function () {
            var k = ns.defineClass({
                inilialize : function () {
                    this.v = 'hoge';
                },
                hoge : function () {
                }
            });
            ok(k, 'crrete class');
            livesOk('init instance', function () { new k(); });
            livesOk('call methods of instance', function () { new k().hoge(); });
        });

        livesOk('createDecoratorOf', function () {
            var c = function () {
                this.val = 'value';
                this.hoge = function () { return 'hoge'};
            };
            var d = ns.createDecoratorOf({methods : ['hoge', 'huga']}, {
                hoge : function (arg) {
                    equal(this.c.val, 'value');
                    return this.c.hoge(arg);
                }
            });
            livesOk('init decorator', function () { new d(new c()); });
            var t = new d(new c());
            console.log(_.keys(t));
            livesOk('call method of decorator', function () { new d(new c()).hoge(); });
        });

        livesOk('use ok createSignature', function () {
            var sig = ns.createSignature(
                ['p1', 'p2'],
                ['m1', 'm2']
            );
        });

        livesOk('use ok isEmptyString', function () {
            equal(ns.isEmptyString(''), true, 'truthy');
            equal(ns.isEmptyString('aa'), false, 'falsy');
        });

        livesOk('use ok fitLengthInto', function () {
            var f = ns.fitLengthInto(1, 30);
            equal(f(0), false);
            equal(f(1), true);
            equal(f(30), true);
            equal(f(31), false);
        });

        livesOk('use ok matchType', function () {
            var mockSig = ns.createSignature([], ['foo', 'bar']);
            var TruthyClass = ns.defineClass({ foo : emptyFunc, bar : emptyFunc});
            var FalsyClass = ns.defineClass({ foo : emptyFunc, hoge : emptyFunc});
            equal(ns.matchType(mockSig,  new TruthyClass()), true, 'truthy');
            equal(ns.matchType(mockSig, new FalsyClass()), false, 'falsy');
        });

        livesOk('use ok matchType', function () {
            var f = ns.fitLengthInto(1, 30);
            equal(f(0), false);
            equal(f(1), true);
            equal(f(30), true);
            equal(f(31), false);
        });

        livesOk('use ok getSuppsedUniqueId', function () {
            ok(ns.getSupposedUniqueId());
        });

        livesOk('use ok toPlainObject', function () {
            var mockSig = ns.createSignature(['name', 'sex', 'age'], ['foo', 'bar']);
            var MockClass = ns.defineClass({
                initialize : function () {
                    this.name = 'n1';
                    this.sed = 's1';
                    this.age = 18;
                },
                foo : emptyFunc,
                bar : emptyFunc
            });
            MockClass.prototype.__signature__ = mockSig;
            var obj = ns.toPlainObject(new MockClass());
        });

       livesOk('use ok getWhiteListChecker', function () {
           var w = ns.getWhiteListChecker(['foo', 'bar']);
           equal(w({foo : 1, bar : 2}), true);
           equal(w({foo : 1, bar : 2, baz : 3}), false);
        });
    });
});

test('ddd.infrastructure', function () {
    Namespace()
    .use('ddd.infrastructure.storage *')
    .use('ddd.infrastructure.repository.board *')
    .use('ddd.infrastructure.repository.member *')
    .apply(function (ns) {
        var s;
        livesOk('init storage', function () {
            s = ns.getStorage();
        });
        livesOk('save storage', function () {
            s.save(1, { id:1, updated_at : 1});
        });
        livesOk('check unique', function () {
            s.save(2, { id:2, updated_at : 0});
        });
        diesOk('check concurrency', function () {
            s.save(1, { id:1, updated_at : 0});
        });
        var v;
        livesOk('load', function () {
            v = s.load(1);
            ok(v);
            equal(v.id, 1, 'id');
            equal(v.updated_at, 1, 'updated_at');
        });

        livesOk('use ok boardrepository', function () {
            ns.getBoardRepository();
        });

        livesOk('use ok memberrepository', function () {
            ns.getMemberRepository();
        });
    });
});

test('ddd.domain', function () {
    Namespace()
    .use('ddd.domain.entity.board *')
    .use('ddd.domain.entity.member *')
    .use('ddd.domain.repository.board *')
    .use('ddd.domain.repository.member *')
    .use('ddd.domain.service.board *')
    .apply(function (ns) {

        var getMockMember = function () {
            return {
                id : 'hoge',
                name : 'huga',
                updated_at : +(new Date()),
                created_at : +(new Date())
            };
        };

        livesOk('use ok entity board', function () {
            var b = ns.getBoard({
                id : 'hoge',
                created_at : +(new Date()),
                updated_at : +(new Date()),
                member : getMockMember(),
                title : 'hoge',
                text : 'huga',
                comment : []
            });
        });

        livesOk('use ok entity member', function () {
            ns.getMember({
                id : 1,
                nickname : 'bla',
                created_at : +(new Date()),
                updated_at : +(new Date())
            });
        });

        livesOk('use ok board repository', function () {
            ns.getBoardRepositoryWithIF({});
        });

        livesOk('use ok member repository', function () {
            ns.getMemberRepositoryWithIF({});
        });

        livesOk('use ok boardservice', function () {
            ns.getBoardService({}, {});
        });
    });
});

test('ddd.application', function () {
    Namespace()
    .use('ddd.application.boardservice *')
    .apply(function (ns) {
        livesOk('use ok boardservice', function () {
            ns.getBoardService(0);
        });
    });
});