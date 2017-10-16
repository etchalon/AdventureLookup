(function () {

    const $results = $('#search-results'),
        $optionsList = $('.options-list'),
        $optionsListInner = $('.option-list-inner'),
        rowHeight = 45, moreRowHeight = 23;

    if (!$results.length) {
        return;
    }

    console.log($optionsListInner);

    $('#search-submit').on('click', () => {
        $('#search-form').submit();
    });

    // Calculate max-height and store in the DOM
    $optionsListInner.each(function(){
        let optionCount = $(this).find('.option:not(.d-none)'),
            allCount = $(this).find('.option'),
            moreCount = $(this).find('.option.show-more'),
            lineCount = optionCount.length - moreCount.length,
            fullCount = allCount.length - moreCount.length;
        // Subtract the "show more"
        // Calc the height and place in a data-* attribute.
        let maxHeightInitial = (lineCount * rowHeight) + (moreCount.length * moreRowHeight);
        let maxHeightAll = (fullCount * rowHeight) + (moreCount.length * moreRowHeight);

        $(this).attr('data-max-height-initial', maxHeightInitial);
        $(this).attr('data-max-height-all', maxHeightAll);
    });

    // Toggle open a filters' options
    $('#adl-sidebar').on('click', '.filter > .title', e => {
        let isOpen = $(e.target).closest('.filter').hasClass('open');
        $(e.target).closest('.filter').toggleClass('open');

        let $optionInner = $(e.target).closest('.filter').find('.option-list-inner');

        $optionInner.each(function() {

            if (isOpen) {
                $optionInner.css({ 'max-height': 0 });
                return;
            }

            let maxHeight = parseInt($(this).attr('data-max-height-initial'), 10);

            if ($optionInner.hasClass('expanded')) {
                maxHeight = parseInt($(this).attr('data-max-height-all'), 10);
            }

            if (maxHeight) {
                $optionInner.css({ 'max-height': `${maxHeight}px` });
            }
        });
    });


    // Set appropriate input option and update visuals for the whole filter
    $optionsList.on('click', '.option', e => {
        let $option = $(e.currentTarget);
        if ($option.hasClass('count')) {
            $option = $option.closest('.option');
        }
        let $filter = $option.closest('.filter'),
            checkbox = $option.find('input[type=checkbox]')[0];

        if (checkbox) {
            $option.toggleClass('filter-marked');
            checkbox.checked = !checkbox.checked;
            // Check or un-check the filter title
            $filter.toggleClass('filter-marked', $filter.find('input[type=checkbox]:checked').length > 0);
            e.preventDefault();
            return;
        }
    });

    // If a filter has more options than displayed, clicking on "more" shows them (obviously)
    $optionsList.on('click', '.show-more', (e) => {

        let $optionInner = $(e.target).closest('.filter').find('.option-list-inner');
        let maxHeight = parseInt($optionInner.attr('data-max-height-all'), 10);

        if (!$optionInner.hasClass('expanded')) {
            $(e.target).closest('.filter').find('.option-list-inner .option.d-none').removeClass('d-none').addClass('h-none');
            $optionInner.css({ 'max-height': `${maxHeight}px` });
            $optionInner.addClass('expanded');
        } else {
            maxHeight = parseInt($optionInner.attr('data-max-height-initial'), 10);
            $optionInner.css({ 'max-height': `${maxHeight}px` });
            $optionInner.removeClass('expanded');
            window.setTimeout( () => {
                $(e.target).closest('.filter').find('.option-list-inner .option.h-none').removeClass('h-none').addClass('d-none');
            }, 250);
        }
    });

    // Show more filters (hopefully the lesser-used ones)
    $('#filter-more').on('click', e => {
        $('#adl-sidebar').find('.filter.d-none').removeClass('d-none');
        $(e.target).hide();
    });

    // Clicking on a filter tag removes it
    $('#search-tags').on('click', '.filter-tag', e => {
        const fieldName = $(e.target).data('field-name'),
            value = $(e.target).data('value'),
            key = $(e.target).data('key'),
            fieldType = $(e.target).data('field-type');

        if (fieldType === 'string') {
            const $strInput = $(`input[name^="f[${fieldName}][v]"][value="${value}"]`);
            if ($strInput.is(':hidden')) {
                $strInput.remove()
            } else {
                $strInput.prop('checked', false);
            }
        } else if (fieldType === 'boolean') {
            $(`input[name^="f[${fieldName}][v]"][value=""]`).prop('checked', true);
        } else if (fieldType === 'integer') {
            $(`input[name^="f[${fieldName}][v][${key}]"]`).val('');
        }

        $('#search-form').submit();
        $(e.target).remove();
    });

    // Load more adventures
    let currentPage = 1;
    const $searchForm = $("#search-form");
    const $loadMoreBtn = $('#load-more-btn');
    $loadMoreBtn.click(function () {
        $loadMoreBtn.attr('disabled', true);
        $loadMoreBtn.find('.fa-spin').removeClass('d-none');

        const data = $searchForm.serialize() + '&page=' + ++currentPage;
        $.ajax({
            method: 'POST',
            url: $searchForm.attr('action'),
            data: data,
        }).done(function (result) {
            $('#search-results').append($(result).find('#search-results'));

            const $newLoadMoreBtn = $(result).find('#load-more-btn')[0];
            $loadMoreBtn.attr('disabled', $($newLoadMoreBtn).is(':disabled'));

            myLazyLoad.update();
        }).fail(function () {
            alert('Something went wrong.');
        }).always(function () {
            $loadMoreBtn.find('.fa-spin').addClass('d-none');
        });
    });
})();
