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

        ns.getBoardService().postNewBoard(params);
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