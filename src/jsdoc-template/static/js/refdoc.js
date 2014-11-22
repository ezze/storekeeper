(function($) {
    var parsedUrls = {};

    function parseUrl(url) {
        if (parsedUrls[url]) {
            return parsedUrls[url];
        }

        var result = {
            url: '',
            file: '',
            anchor: '',
            params: {}
        };

        var questionPos = url.indexOf('?');

        if (questionPos >= 0) {
            result.url = url.substr(0, questionPos);
        }
        else {
            result.url = url;
        }

        var anchorPos = result.url.indexOf('#');
        if (anchorPos >= 0) {
            result.anchor = result.url.substr(anchorPos + 1);
            result.url = result.url.substr(0, anchorPos);
        }

        var backslashPos = result.url.lastIndexOf('/');
        if (backslashPos >= 0) {
            result.file = result.url.substr(backslashPos + 1);
        }
        else {
            result.file = result.url;
        }

        if (questionPos === -1) {
            parsedUrls[url] = result;
            return result;
        }

        var query = url.substr(questionPos + 1);

        var ampPos, equalPos, pair, name, value;
        while (query) {
            if ((ampPos = query.indexOf('&')) >= 0) {
                pair = query.substr(0, ampPos);
                query = query.substr(ampPos + 1);
            }
            else {
                pair = query;
                query = '';
            }

            equalPos = pair.indexOf('=');
            if (equalPos >= 0) {
                name = pair.substr(0, equalPos);
                value = pair.substr(equalPos + 1);
            }
            else {
                name = pair;
                value = undefined;
            }

            result.params[name] = value;
        }

        parsedUrls[url] = result;
        return result;
    }

    $(document).ready(function() {
        var params = parseUrl(window.location.href);

        var jqContent = $('#content');
        var jqSidebar = $('#sidebar');
        var jqLists = jqSidebar.find('ul');
        var jqItems = jqLists.find('li');

        // Creating filter input field
        var jqFilterInput = $('<input />')
            .addClass('form-control')
            .keyup(function(event) {
                onFilter.bind(this)();
                if ($(this).val() && event.keyCode === 13) {
                    var jqSelectedItem = jqItems.not('.hidden').first();
                    if (jqSelectedItem.length === 1) {
                        jqItems.removeClass('active');
                        jqSelectedItem.addClass('active').children('a').trigger('click');
                    }
                }
            })
            .val(params.params.filter ? params.params.filter : '');

        jqSidebar.find('h2:first').after(jqFilterInput).children('a').text('Storekeeper');

        var isIndexPage = false;

        // Moving table of contents to sidebar
        jqContent.find('h2').filter(function() {
            var text = $(this).text();
            return text === 'Table of contents';
        }).each(function() {
            isIndexPage = true;

            var jqTableOfContents = $(this).next('ul')
                .addClass('nav')
                .addClass('nav-pills')
                .addClass('nav-stacked')
                .addClass('nav-condensed')
                .attr('id', 'table-of-contents')

            jqTableOfContents.find('ul')
                .addClass('nav')
                .addClass('nav-pills')
                .addClass('nav-stacked')
                .addClass('nav-condensed');

            jqTableOfContents.detach();
            jqSidebar.find('h2:first').after(jqTableOfContents).replaceWith($('<h2>Table of contents</h2>'));
            jqContent.find('h1.page-title').remove();
            $(this).remove();

            var jqLinks = jqTableOfContents.find('a');
            var links = [];

            // Highlighting active link of table of contents of click
            jqLinks.each(function() {
                var url = $(this).attr('href');
                var urlParams = parseUrl(url);
                if (urlParams.anchor === params.anchor) {
                    $(this).parent().addClass('active');
                }

                var jqHeader = jqContent.find('a[name="' + url.replace(/^#/, '') + '"]');
                if (jqHeader.length === 0) {
                    return;
                }

                links.push({
                    jqLink: $(this),
                    top: jqHeader.position().top
                });
            });

            // Highlighting relevant link of table of contents on scroll
            jqContent.on('scroll', function(event) {
                var scrollTop = ($(this).scrollTop());
                jqLinks.parents('li').removeClass('active');
                for (var i = links.length - 1; i >= 0; i--) {
                    var link = links[i];
                    if (scrollTop >= link.top - 2) {
                        link.jqLink.parent().addClass('active');
                        break;
                    }
                }
            });
        });

        // Overriding sidebar links by adding filter GET-parameter
        // and activating current one
        var itemsUrls = [];
        jqItems.children('a').click(function(event) {
            event.preventDefault();
            var link = $(this).attr('href');
            var filter = jqFilterInput.val().toLowerCase();
            if (filter) {
                link += '?filter=' + filter;
            }
            window.location = link;
        }).each(function() {
            var url = $(this).attr('href');
            itemsUrls.push(url);
            var urlParams = parseUrl(url);
            if (urlParams.file === params.file) {
                $(this).parent().addClass('active');
            }
        });

        // Removing module prefixes from members' links
        var moduleLinkTextRegExp = /^module:([^#]+(#.+)?)$/;
        jqContent.find('a').each(function() {
            var href = $(this).attr('href');
            if (!href) {
                return;
            }

            var text = $(this).text();
            var urlParams = parseUrl(href);

            var textMatch = text.match(moduleLinkTextRegExp);
            if (textMatch === null) {
                return;
            }

            if (urlParams.file === params.file && textMatch[2]) {
                $(this).text(textMatch[2]);
            }
            else {
                $(this).text(textMatch[1]);
            }
        });

        // Highlighting source code's line
        var jqSourceCode = $('pre.source-code');
        if (jqSourceCode.length > 0) {
            var jqSourceCodeLines = jqSourceCode.find('ol li');
            var codeLineAnchorRegExp = /^line(\d+)$/;
            var lineMatch = params.anchor.match(codeLineAnchorRegExp);
            if (lineMatch !== null) {
                var lineNumber = parseInt(lineMatch[1], 10);
                var jqSourceCodeLine = jqSourceCodeLines.eq(lineNumber - 1).addClass('highlighted');
                var offset = jqSourceCodeLine.offset();
                var scrollTop = (offset.top + jqSourceCodeLine.height() / 2) - jqContent.height() / 2;
                jqContent.scrollTop(scrollTop);
            }

            var result;
            jqSourceCodeLines.each(function() {
                var jqCode = $(this).children('code');
                if (result && result.top) {
                    result = hljs.highlight('javascript', jqCode.text(), true, result.top);
                }
                else {
                    result = hljs.highlight('javascript', jqCode.text());
                }
                jqCode.html(result.value);
            });
        }

        // Highlighting syntax of code blocks
        $('pre code').each(function() {
            var languages;
            if (isIndexPage) {
                languages = ['bash', 'xml', 'javascript'];
            }
            else if ($(this).parent().hasClass('example-code')) {
                languages = ['javascript'];
            }
            else {
                return;
            }

            var jqCode = $(this);
            var result = hljs.highlightAuto(jqCode.text(), languages);
            jqCode.html(result.value);
        });

        if (isIndexPage) {
            // Inserting links to reference documentation of API modules from index page
            var moduleLinkRegExp = /^(\w+)(#(\w+))?$/;
            jqContent.find('code').each(function() {
                if ($(this).parent().prop('tagName').toLowerCase() === 'pre') {
                    return;
                }

                var text = $(this).text();
                var textMatch = text.match(moduleLinkRegExp);
                if (textMatch === null) {
                    return;
                }

                if ($.inArray('module-' + textMatch[1] + '.html', itemsUrls) === -1) {
                    return;
                }

                $(this).text('').append($('<a></a>')
                    .attr('href', 'module-' + textMatch[1] + '.html' + (textMatch[2] ? textMatch[2] : ''))
                    .text(text)
                );
            });
        }

        onFilter.bind(jqFilterInput.get(0))();

        function onFilter() {
            var filter = $(this).val().toLowerCase();
            jqItems.each(function() {
                if ($(this).children('a').text().toLowerCase().indexOf(filter) >= 0) {
                    $(this).removeClass('hidden');
                }
                else {
                    $(this).addClass('hidden');
                }
            });
            jqLists.each(function() {
                if ($(this).children(':not(.hidden)').length === 0) {
                    $(this).addClass('hidden');
                    $(this).prev('h3').addClass('hidden');
                }
                else {
                    $(this).removeClass('hidden');
                    $(this).prev('h3').removeClass('hidden');
                }
            });
        }
    });
})(jQuery);