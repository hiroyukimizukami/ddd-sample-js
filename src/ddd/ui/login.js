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