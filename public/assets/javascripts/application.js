/*jslint browser: true, white: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, newcap: true, immed: true, indent: 4, onevar: false */
/*global window, $, jQuery, _ */
/* ------------------------------------------------------------------------
 * application.js
 * This file is part of Stud.IP - http://www.studip.de
 *
 * Stud.IP is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Stud.IP is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Stud.IP; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor,
 * Boston, MA  02110-1301  USA
 */

/* ------------------------------------------------------------------------
 * ajax_loader
 * ------------------------------------------------------------------------ */
jQuery('[data-behaviour="\'ajaxContent\'"]').live('click', function () {
    var parameters = jQuery(this).metadata(),
    indicator = ("indicator" in parameters) ? parameters.indicator : this,
    target    = ("target" in parameters) ? parameters.target : jQuery(this).next(),
    url       = ("url" in parameters) ? parameters.url : jQuery(this).attr('href');

    jQuery(indicator).showAjaxNotification('right');
    jQuery(target).load(url, function () {
        jQuery(indicator).hideAjaxNotification();
    });
    return false;
});


// Global handler:
// Open a link in a lightbox (jQuery UI's Dialog). The Dialog's title
// can be set via a specific "X-Title"-header in the xhr response.
// Any included link with a rel value containing "option" in the response
// will be transformed into a button of the lightbox and removed from the
// response. A close button is always present.
jQuery('a[rel~="lightbox"]').live('click', function (event) {
    var $that     = jQuery(this),
        href      = $that.attr('href'),
        container = jQuery('<div/>');

    // Load response into a helper container, open dialog after loading
    // has finished.
    container.load(href, function (response, status, xhr) {
        var width   = jQuery('body').width() * 2 / 3,
            height  = jQuery('body').height() * 2 / 3,
            buttons = {},
            title   = xhr.getResponseHeader('X-Title') || '',
            scripts = jQuery(response).filter('script');

        // Create buttons
        jQuery('a[rel~="option"]', this).remove().each(function () {
            var label = jQuery(this).text(),
                href  = jQuery(this).attr('href');
            buttons[label] = function () { location.href = href; };
        });
        buttons["Schliessen".toLocaleString()] = function () {
            jQuery(this).dialog('close');
        };

        // Create dialog
        jQuery(this).dialog({
            width :  width,
            height:  height,
            buttons: buttons,
            title:   title,
            modal:   true,
            open: function () {
                jQuery('head').append(scripts);
            }
        });
    });

    event.preventDefault();
});


/* ------------------------------------------------------------------------
 * messages boxes
 * ------------------------------------------------------------------------ */
jQuery('.messagebox .messagebox_buttons a').live('click', function () {
    if (jQuery(this).is('.details')) {
        jQuery(this).closest('.messagebox').toggleClass('details_hidden');
    } else if (jQuery(this).is('.close')) {
        jQuery(this).closest('.messagebox').hide('blind', 'fast', function () {
            jQuery(this).remove();
        });
    }
    return false;
}).live('focus', function () {
    jQuery(this).blur(); // Get rid of the ugly "clicked border" due to the text-indent
});


/* ------------------------------------------------------------------------
 * application wide setup
 * ------------------------------------------------------------------------ */
jQuery(function () {
    // AJAX Indicator
    STUDIP.ajax_indicator = true;
    STUDIP.URLHelper.base_url = STUDIP.ABSOLUTE_URI_STUDIP;

    STUDIP.study_area_selection.initialize();

    // validate forms
    STUDIP.Forms.initialize();

    // autofocus for all browsers
    if (!("autofocus" in document.createElement("input"))) {
        jQuery('[autofocus]').first().focus();
    }

    jQuery('.add_toolbar').addToolbar();

    jQuery('textarea.resizable').resizable({
        handles: 's',
        minHeight: 50,
        zIndex: 1
    });

});


/* ------------------------------------------------------------------------
 * application collapsable tablerows
 * ------------------------------------------------------------------------ */
jQuery(function ($) {

    $('table.collapsable .toggler').focus(function () {
        $(this).blur();
    }).click(function () {
        $(this).closest('tbody').toggleClass('collapsed');
        return false;
    });

    $('a.load-in-new-row').live('click', function () {
        if ($(this).data('busy')) {
            return false;
        }

        if ($(this).closest('tr').next().hasClass('loaded-details')) {
            $(this).closest('tr').next().remove();
            return false;
        }
        $(this).showAjaxNotification().data('busy', true);

        var that = this;
        $.get($(this).attr('href'), function (response) {
            var row = $('<tr />').addClass('loaded-details');

            $('<td />')
                .attr('colspan', $(that).closest('td').siblings().length + 1)
                .html(response)
                .appendTo(row);

            $(that)
                .hideAjaxNotification()
                .closest('tr').after(row);

            $(that).data('busy', false);
            $('body').trigger('ajaxLoaded');
        });

        return false;
    });

    $('.loaded-details a.cancel').live('click', function () {
        $(this).closest('.loaded-details').prev().find('a.load-in-new-row').click();
        return false;
    });

});


/* ------------------------------------------------------------------------
 * only numbers in the input field
 * ------------------------------------------------------------------------ */
jQuery('input.allow-only-numbers').live('keyup', function () {
    jQuery(this).val(jQuery(this).val().replace(/\D/, ''));
});


/* ------------------------------------------------------------------------
 * additional jQuery (UI) settings for Stud.IP
 * ------------------------------------------------------------------------ */
jQuery.ui.accordion.prototype.options.icons = {
    header: 'arrow_right',
    headerSelected: 'arrow_down'
};


/* ------------------------------------------------------------------------
 * jQuery datepicker
 * ------------------------------------------------------------------------ */
jQuery(function ($) {
    $.datepicker.regional.de = {
        closeText: 'schlie�en',
        prevText: '&#x3c;zur�ck',
        nextText: 'Vor&#x3e;',
        currentText: 'heute',
        monthNames: ['Januar', 'Februar', 'M�rz', 'April', 'Mai', 'Juni',
                     'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
        monthNamesShort: ['Jan', 'Feb', 'M�r', 'Apr', 'Mai', 'Jun',
                          'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
        dayNames: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
        dayNamesShort: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
        dayNamesMin: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
        weekHeader: 'Wo',
        dateFormat: 'dd.mm.yy',
        firstDay: 1,
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: ''
    };
    $.datepicker.setDefaults($.datepicker.regional.de);
}(jQuery));

/* ------------------------------------------------------------------------
 * jQuery timepicker
 * ------------------------------------------------------------------------ */

/* German translation for the jQuery Timepicker Addon */
/* Written by Marvin */
(function($) {
    $.timepicker.regional.de = {
        timeOnlyTitle: 'Zeit w�hlen',
        timeText: 'Zeit',
        hourText: 'Stunde',
        minuteText: 'Minute',
        secondText: 'Sekunde',
        millisecText: 'Millisekunde',
        timezoneText: 'Zeitzone',
        currentText: 'Jetzt',
        closeText: 'Fertig',
        timeFormat: 'HH:mm',
        amNames: ['vorm.', 'AM', 'A'],
        pmNames: ['nachm.', 'PM', 'P'],
        isRTL: false
    };
    $.timepicker.setDefaults($.timepicker.regional.de);
})(jQuery);


jQuery(function ($) {
    $('a.print_action').live('click', function (event) {
        var url_to_print = this.href;
        $('<iframe/>', {
            name: url_to_print,
            src: url_to_print,
            width: '1px',
            height: '1px',
            frameborder: 0
        })
        .css({top: '-99px', position: 'absolute'})
        .appendTo('body')
        .load(function () {
            this.contentWindow.focus();
            this.contentWindow.print();
        });
        return false;
    });
});
