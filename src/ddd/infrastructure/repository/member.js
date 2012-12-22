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