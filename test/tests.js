(function (T, $) {
  var $target, $targetShell, $toggle, datalist, $items, $search, $hidden;

  T.testStart(function () {
    $.fx.off = true;
    datalist = [
      {value:  1, text: 'foo'},
      {value:  2, text: 'bar'},
      {value:  3, text: 'baz'},
      {value:  4, text: 'qux'},
      {value:  5, text: 'quux'},
      {value:  6, text: 'corge'},
      {value:  7, text: 'grault'},
      {value:  8, text: 'garply'},
      {value:  9, text: 'waldo'},
      {value: 10, text: 'fred'},
      {value: 11, text: 'plugh'},
      {value: 12, text: 'xyzzy'},
      {value: 13, text: 'thud'},
      {value: 14, text: 'foobar'}
    ];
  });

  T.testDone(function () {
    destroyMultilist();
    $.fx.off = false;
  });

  var destroyMultilist = function() {
    if ($target) {
      $target.remove();
      $target = null;
      $targetShell.remove();
    }
  };

  var initMultilist = function(options, attributes) {
    destroyMultilist();
    $(document.body).append('<div id="target" name="target" style="display: none;" />');
    $target = $('div#target');
    $target.attr(attributes || {});
    $target.multilist(options || {
      datalist: datalist
    });
    $targetShell = $('.multilist-shell', $target);
    $toggle = $('a.label', $target);
    $items = $('.multilist-holder.items a', $targetShell);
    $search = $('.multilist-holder.search input[role="search"]', $targetShell);
    $hidden = $('input[name="target"]', $target);
  };

  Array.prototype.map = Array.prototype.map || function(fn) {
    var ret = [];

    for (var i = 0; i < this.length; ++i) {
      ret.push(fn(this[i]));
    }

    return ret;
  };

  String.prototype.trim = String.prototype.trim || function() {
    return this.replace(/^\s+|\s+$/g, '');
  };

  /*** INIT ***/

  T.module('init');

  T.test('adds proper attributes to and shows the target', function() {
    initMultilist();

    T.equal($target.attr('role'), 'listbox', '`role\' attribute should be set to `listbox\'');
    T.equal($target.attr('aria-multiselectable'), 'true', '`aria-multiselectable\' attribute should be set to `true\'');
    T.ok($target.is(':visible'), 'Target should be made visible');
  });

  T.test('renders datalist items as list items', function() {
    initMultilist();

    T.equal($items.length, datalist.length, 'Should render all the items from the datalist (and no more)');
    $items.each(function(i, e) {
      var item = datalist[i];
      var $e = $(e);

      T.equal($e.attr('value'), item.value, '`value\' attribute of item should be set to datalist item value');
      T.equal($e.text().trim(), item.text, 'Text of item should contain datalist item text');
    });
  });

  T.test('renders selected items as selected', function() {
    datalist[0].selected = datalist[1].selected = true;

    initMultilist();

    T.equal($('.multilist-holder.items a.selected', $target).length, 2, 'Number of items with `selected\' css class should equal number of items selected');
  });

  T.test('renders items datalist items where keys are capitalized', function() {
    datalist[0].selected = datalist[1].selected = true;
    datalist = $.map(datalist, function(item) {
      return {Text: item.text, Value: item.value, Selected: item.selected};
    });

    initMultilist({datalist: datalist});

    $items.each(function(i, e) {
      var item = datalist[i];
      var $e = $(e);

      T.equal($e.attr('value'), item.Value, '`value\' attribute of item should be set to datalist item value');
      T.equal($e.text().trim(), item.Text, 'Text of item should contain datalist item text');
    });
    T.equal($('.multilist-holder.items a.selected', $target).length, 2, 'Number of items with `selected\' css class should equal number of items selected');
  });

  T.test('renders a hidden input with the same name as the target div when div has a name', function() {
    initMultilist();

    T.equal($hidden.length, 1, 'Hidden input should be rendered');
    T.equal($hidden.attr('type'), 'hidden', 'Hidden input should be hidden');
  });

  T.test('removes the name attribute from the target div (breaks unobtrusive validation)', function() {
    initMultilist();

    T.deepEqual($target.attr('name'), undefined, 'Name attribute should be removed');
  });

  T.test('copies any HTML5 data-* attributes from target to hidden input', function() {
    var attr = {
      'data-val': 'foo',
      'data-foobar': 'baz'
    };
    initMultilist(null, attr);

    $.each(attr, function(key, value) {
      T.equal($hidden.attr(key), value, 'Should copy any data-* attributes');
    });
  });

  T.module('init single');

  T.test('sets `maxSelected\' to 1 and `closeOnMax\' to true, overriding defaults', function() {
    initMultilist({single: true});
    var settings = $target.data().multilist;

    T.equal(1, settings.maxSelected, '`maxSelected\' should be overridden and set to 1');
    T.ok(settings.closeOnMax, '`closeOnMax\' should be overridden and set to true');
  });

  T.test('sets `maxSelected\' to 1 and `closeOnMax\' to true, overriding provided values', function() {
    initMultilist({single: true, maxSelected: 42, closeOnMax: false});
    var settings = $target.data().multilist;

    T.equal(settings.maxSelected, 1, '`maxSelected\' should be overridden and set to 1');
    T.ok(settings.closeOnMax, '`closeOnMax\' should be overridden and set to true');
  });

  T.test('does not render checkboxes for list items', function() {
    initMultilist({datalist: datalist, single: true});

    T.equal($('div.checkbox', $target).length, 0, 'No checkbox divs should be rendered in single item mode');
  });

  /*** CLICK WHEN CLOSED ***/

  T.module('label click when closed', {
    setup: function() {
      initMultilist();
    }
  });

  T.test('shows and focuses search', function() {
    var $searchHolder = $('div.search', $target);

    $toggle.trigger('click');

    T.ok($searchHolder.is(':visible'), 'Search element holder should be made visible');
    T.ok($search.is(':focus') || $search[0] == document.activeElement, 'Search element should have focus');
  });

  T.test('shows items', function() {
    $toggle.trigger('click');

    var $itemsHolder = $('div.items', $targetShell);

    T.ok($itemsHolder.length == 1, 'Items holder element should be created');
    T.ok($itemsHolder.is(':visible'), 'Items holder element should be made visible');
  });

  T.test('adds `opened\' css class', function() {
    $toggle.trigger('click');

    T.ok($target.hasClass('opened'), 'Target should have `opened\' css class');
  });

  /*** CLICK WHEN OPEN ***/

  T.module('label click when open', {
    setup: function() {
      initMultilist();
      $toggle.trigger('click');
    }
  });

  T.test('clears the search and filters', function() {
    var $searchHolder = $('div.search', $target);
    $search.val('foo');
    $items.addClass('filtered');

    $toggle.trigger('click');

    T.ok(!$searchHolder.is(':visible'), 'Search element holder should be hidden');
    T.equal($search.val(), '', 'Search string should be cleared');
    $items.each(function(i, e) {
      T.ok(!$(e).hasClass('filtered'), 'Item should not be filtered');
    });
  });

  T.test('removes `opened\' css class', function() {
    $toggle.trigger('click');

    T.ok(!$target.hasClass('opened'), 'Should remove `opened\' class');
  });

  /*** SEARCH BOX KEYUP ***/

  T.module('search box keyup', {
    setup: function() {
      initMultilist();
      $toggle.trigger('click');
    }
  });

  T.test('does nothing when less than 3 characters entered', function() {
    var item = datalist[0];

    $search.val(item.text.substring(0, 1));
    $search.trigger('keyup');

    T.ok(!$('.multilist-holder.items a', $targetShell).hasClass('filtered'), 'Should not filter after only 1 character');

    $search.val(item.text.substring(0, 2));
    $search.trigger('keyup');

    T.ok(!$('.multilist-holder.items a', $targetShell).hasClass('filtered'), 'Should not filter after only 2 characters');

    $search.val(item.text.substring(0, 3));
    $search.trigger('keyup');

    T.ok($('.multilist-holder.items a', $targetShell).hasClass('filtered'), 'Should have some items filtered');
  });

  T.test('filters items which don\'t match the entered text', function() {
    var searchStr = 'foo';

    $search.val(searchStr);
    $search.trigger('keyup');

    $('a.filtered', $targetShell).each(function(i, e) {
      var text = $(e).text();
      T.equal(text.indexOf(searchStr), -1, 'Item with text `' + text.trim() + '\' which does not match search string `' + searchStr + '\' should be filtered');
    });

    $($items.filter(function(i) {return $(this).text().indexOf(searchStr) > -1})).each(function(i, e) {
      T.ok(true, 'Item with text `' + $(e).text() + '\' should be found to match search string `' + searchStr + '\'');
    });
  });

  /*** CHECKBOX CLICK WHEN ITEM UNSELECTED ***/

  T.module('checkbox click when item unselected', {
    setup: function() {
      initMultilist();
      $toggle.trigger('click');
    }
  });

  T.test('selects the parent list item', function() {
    var $firstItem = $('.multilist-holder.items a', $targetShell).first();
    $('div.checkbox', $firstItem).trigger('click');

    T.ok($firstItem.hasClass('selected'), 'Parent item should be selected after clicking checkbox');
  });

  /*** LIST ITEM CLICK WHEN UNSELECTED ***/

  T.module('list item click when unselected', {
    setup: function() {
      initMultilist();
      $toggle.trigger('click');
    }
  });

  T.test('selects the clicked item', function() {
    var $firstItem = $('.multilist-holder.items a', $targetShell).first().trigger('click');

    T.ok($firstItem.hasClass('selected'), 'Should be selected after clicking');
  });

  T.test('calls onChange if set', function() {
    var called = false;
    initMultilist({datalist: datalist, onChange: function() {
      called = true;
    }});

    $('.multilist-holder.items a', $target).first().trigger('click');

    T.ok(called, 'Should call the onChange callback');
  });

  T.test('does not select item when default maxSelected of 10 already reached', function() {
    var $tenth = $($items[10]);
    $($items.slice(0, 10)).trigger('click');

    $tenth.trigger('click');

    T.ok(!$tenth.hasClass('selected'), 'Should not select item and exceed maxSelected');
  });

  T.test('allows for a maxSelected of 1', function() {
    initMultilist({datalist: datalist, maxSelected: 1});
    var $second = $($items[1]);
    $items.first().trigger('click');

    $second.trigger('click');

    T.ok(!$second.hasClass('selected'), 'Should not select item and exceed maxSelected');
  });

  T.test('serializes the chosen values', function() {
    var expected;
    for (var i = 1; i < datalist.length; ++i) {
      initMultilist({datalist: datalist, maxSelected: i});

      $($items.slice(0, i)).trigger('click');
      expected = datalist.slice(0, i).map(function(x) {return x.value;}).join('|');
      
      T.equal($target.val(), expected, 'All chosen values should be serialized');
      T.equal($hidden.val(), expected, 'Serialized value should be set on hidden input');
    }
  });

  T.test('closes the list when closeOnMax set and maxSelected reached', function() {
    for (var i = 1; i < datalist.length; ++i) {
      initMultilist({datalist: datalist, maxSelected: i, closeOnMax: true});
      $toggle.trigger('click');

      $($items.slice(0, i)).trigger('click');

      T.ok(!$target.hasClass('opened'), 'Reaching maxSelected should close the list');
    }
  });

  T.test('sets the label text to the text of the selected item when single is true', function() {
    initMultilist({datalist: datalist, single: true});
    $toggle.trigger('click');

    $items.first().trigger('click');

    T.equal($('span.labeltext', $toggle).text().trim(), datalist[0].text, 'Label should show selected item');
  });

  /*** CHECKBOX CLICK WHEN ITEM SELECTED ***/

  T.module('checkbox click when item selected', {
    setup: function() {
      initMultilist();
      $toggle.trigger('click');
      $items.first().trigger('click');
    }
  });

  T.test('selects the parent list item', function() {
    var $firstItem = $('.multilist-holder.items a', $target).first();
    $('div.checkbox', $firstItem).trigger('click');

    T.ok(!$firstItem.hasClass('selected'), 'Parent item should not be selected after clicking checkbox');
  });

  /*** LIST ITEM CLICK WHEN SELECTED ***/

  T.module('list item click when selected', {
    setup: function() {
      initMultilist({datalist: datalist, maxSelected: 0});
      $toggle.trigger('click');
      $items.first().trigger('click');
    }
  });

  T.test('deselects the item', function() {
    $items.first().trigger('click');

    T.ok(!$items.first().hasClass('selected'), 'Should not be selected after selecting and deselecting');
  });

  T.test('serializes the remaining chosen values', function() {
    var expected = datalist.slice(1, datalist.length).map(function(x) {return x.value;}).join('|');

    $items.trigger('click');

    T.equal($target.val(), expected, 'All values except the first should be serialized');
    T.equal($hidden.val(), expected, 'Serialized value should also be written to hidden input');
  });

  /*** LIST ITEM CLICK WHEN OTHER ITEM SELECTED ***/

  T.module('list item click when other item selected', {
    setup: function() {
      initMultilist();
      $toggle.trigger('click');
      $items.first().trigger('click');
    }
  });

  T.test('selects the new item along with the previous one', function() {
    $items.last().trigger('click');

    T.equal($items.filter('.selected').length, 2, 'Two items should now be selected');
  });

  T.test('changes the selection when single is true', function() {
    initMultilist({datalist: datalist, single: true});
    $toggle.trigger('click');
    $items.first().trigger('click');

    $toggle.trigger('click');
    $items.last().trigger('click');

    T.equal($items.filter('.selected').text(), $items.last().text(), 'Last item should now be selected');
  });

  T.module('remove click', {
    setup: function() {
      initMultilist({datalist: datalist, canRemove: true});
    }
  });

  T.test('removes the target from the document completely', function () {
    $('a.remove', $target).trigger('click');

    T.equal(0, $($target.selector).length, 'Should no longer exist within the document');
  });

  T.test('removes the target shell from the document completely', function () {
    $('a.remove', $target).trigger('click');
    // Can't use $targetShell.selector for this as the selector won't be 
    // valid after the shell is attached to the body.
    T.equal(false, $.contains(document, $targetShell[0]), 'Should no longer exist within the document');
  });


  T.module('ui', {
    setup: function () {
      initMultilist({ datalist: datalist, canRemove: true });
    }
  });

  T.test('shell is the same width as the multilist parent', function () {
    $target.width(400); // need to set width so the widths aren't the default css values.
    $toggle.trigger('click');

    T.equal($targetShell.width(), $target.width());
  });

  T.test('shell is positioned directly underneath multilist parent', function () {
    var expectedPosition = $target.position();
    expectedPosition.top = expectedPosition.top + $target.height();
    $toggle.trigger('click');

    T.equal($targetShell.css('top'), expectedPosition.top + 'px');
    T.equal($targetShell.css('left'), expectedPosition.left + 'px');
  });

  T.test('shell is positioned directly underneath multilist parent when parent has a bunch of offset parents', function () {
    var offsetParent = $('<div></div>');
    $('body').append(offsetParent);
    offsetParent.css({
      margin: 10,
      padding: 10,
      top: 10,
      left: 10,
      position: 'relative'
    });
    $target.appendTo(offsetParent);
    var expectedPosition = $target.offset();
    expectedPosition.top = expectedPosition.top + $target.height();
    $toggle.trigger('click');

    T.equal($targetShell.css('top'), expectedPosition.top + 'px');
    T.equal($targetShell.css('left'), expectedPosition.left + 'px');
  });


  /*** CLEAR FOR RESET ***/

  T.module('clear', {
    setup: function() {
      initMultilist();
    }
  });
  
  T.test('clear removes any selected items.', function() {
    initMultilist({datalist: datalist, labelText:'--select here--'});
    $toggle.trigger('click');
    $items.last().trigger('click');

    $target.multilist('clear');

    T.equal($items.filter('.selected').text(), '', 'No items should be selected');
    T.equal($target.multilist('getSelected'), '', 'No value should be selected');
    T.equal($target.attr('aria-valuetext'), '', 'This aria-value should be empty');
    T.equal($target.attr('value'), '', 'This value should be empty');
    T.equal($('span.labeltext').text(), '--select here--', 'Label text should be reset to default')
    T.equal($hidden.val(), '', 'hidden value empty');
  });


} (QUnit, jQuery));
