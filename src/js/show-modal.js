'use strict';

import $ from 'jquery';
import _ from 'lodash';
import Bootstrap from 'bootstrap';

/**
 * Shows Bootstrap's modal window.
 *
 * <p>If another window is already shown this function will do nothing.</p>
 *
 * @author Dmitriy Pushkov <ezze@ezze.org>
 * @since 0.1.1
 * @alias module:showModal
 * @function
 *
 * @param {Object} options
 *      JavaScript object with the following properties:
 * @param {String} options.title
 *      Window's title text.
 * @param {String} options.html
 *      HTML contents of window's body.
 * @param {Boolean} [options.closeButton=false]
 *      If set to <code>true</code> then window can be closed by user.
 * @returns {Object} jQuery deferred object.
 */
var showModal = function(options) {
    var jqBody = $('body');
    if (jqBody.children('.modal').length > 0) {
        return;
    }

    if (!_.isString(options.title) || _.isEmpty(options.title)) {
        throw new Error('Title is invalid or not specified.');
    }

    if (!_.isString(options.html) || _.isEmpty(options.html)) {
        throw new Error('Content HTML is invalid or not specified.');
    }

    if (!_.isBoolean(options.closeButton)) {
        options.closeButton = false;
    }

    var jqModal = $('<div></div>')
        .addClass('modal')
        .addClass('fade')
        .append($('<div></div>')
            .addClass('modal-dialog')
            .append($('<div></div>')
                .addClass('modal-content')
                .append($('<div></div>')
                    .addClass('modal-header')
                    .append($('<h4></h4>')
                        .addClass('modal-title')
                        .text(options.title)
                    )
                )
                .append($('<div></div>')
                    .addClass('modal-body')
                    .html(options.html)
                )
                .append($('<div></div>')
                    .addClass('modal-footer')
                )
            )
        );

    if (options.closeButton) {
        jqModal.find('.modal-header').prepend($('<button></button>')
            .attr('type', 'button')
            .addClass('close')
            .attr('data-dismiss', 'modal')
            .append($('<span></span>')
                .attr('aria-hidden', 'true')
                .html('&times;')
            )
            .append($('<span></span>')
                .addClass('sr-only')
                .text('Close')
            )
        );

        jqModal.find('.modal-footer').append($('<button></button>')
            .attr('type', 'button')
            .addClass('btn')
            .addClass('btn-default')
            .attr('data-dismiss', 'modal')
            .text('Close')
        );
    }

    var deferred = new $.Deferred();

    jqModal.modal({
        backdrop: options.closeButton ? true : 'static',
        keyboard: false,
        show: true
    }).on('hidden.bs.modal', function(event) {
        jqModal.remove();
        deferred.resolve();
    }).appendTo(jqBody);

    return deferred;
};

export default showModal;