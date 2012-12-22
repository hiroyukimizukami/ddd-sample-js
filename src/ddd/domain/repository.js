Namespace('ddd.domain.repository')
.use('ddd.utils.misc')
.define(function (ns) {
    var RepositorySignature = ns.createSignature(
        [],
        ['add', 'drop', 'update', 'find', 'lookup']
    );

    ns.provide({
        RepositorySignature : RepositorySignature
    });
});