/* global $ $create dom messageBoxProxy */// dom.js
/* global installed */// manage.js
/* global prefs */
/* global t */// localization.js
'use strict';

const sorter = (() => {

  const COL_MIN = 300; // same as options.html
  const COL_MAX = 9999; // same as options.html
  const COL_PROP = '--columns';

  const sorterType = {
    alpha: (a, b) => a < b ? -1 : a === b ? 0 : 1,
    number: (a, b) => (a || 0) - (b || 0),
  };

  const tagData = {
    title: {
      text: t('genericTitle'),
      parse: v => v.styleNameLC,
      sorter: sorterType.alpha,
    },
    usercss: {
      text: 'Usercss',
      parse: v => v.styleMeta.usercssData ? 0 : 1,
      sorter: sorterType.number,
    },
    disabled: {
      text: '', // added as either "enabled" or "disabled" by the addOptions function
      parse: v => v.styleMeta.enabled ? 1 : 0,
      sorter: sorterType.number,
    },
    dateInstalled: {
      text: t('dateInstalled'),
      parse: v => v.styleMeta.installDate,
      sorter: sorterType.number,
    },
    dateUpdated: {
      text: t('dateUpdated'),
      parse: ({styleMeta: s}) => s.updateDate || s.installDate,
      sorter: sorterType.number,
    },
    size: {
      text: t('genericSize'),
      parse: v => v.styleSize,
      sorter: sorterType.number,
    },
  };

  // Adding (assumed) most commonly used ('title,asc' should always be first)
  // whitespace before & after the comma is ignored
  const selectOptions = [
    '{groupAsc}',
    'title,asc',
    'dateInstalled,desc, title,asc',
    'dateInstalled,asc, title,asc',
    'dateUpdated,desc, title,asc',
    'dateUpdated,asc, title,asc',
    'usercss,asc, title,asc',
    'usercss,desc, title,asc',
    'disabled,asc, title,asc',
    'disabled,desc, title,asc',
    'disabled,desc, usercss,asc, title,asc',
    'size,desc, title,asc',
    '{groupDesc}',
    'title,desc',
    'usercss,asc, title,desc',
    'usercss,desc, title,desc',
    'disabled,desc, title,desc',
    'disabled,desc, usercss,asc, title,desc',
  ];
  const splitRegex = /\s*,\s*/;
  const ID = 'manage.newUI.sort';
  const getPref = () => prefs.get(ID) || prefs.defaults[ID];

  let columns = 1;
  let minWidth;

  function init() {
    prefs.subscribe(ID, sorter.update);
    $('#sorter-help').onclick = showHelp;
    addOptions();
    prefs.subscribe('manage.minColumnWidth', updateColumnWidth, {runNow: true});
  }

  function addOptions() {
    let container;
    const select = $('#' + ID);
    const renderBin = document.createDocumentFragment();
    const option = $create('option');
    const optgroup = $create('optgroup');
    const meta = {
      desc: ' \u21E9',
      enabled: t('genericEnabledLabel'),
      disabled: t('genericDisabledLabel'),
      dateNew: ` (${t('sortDateNewestFirst')})`,
      dateOld: ` (${t('sortDateOldestFirst')})`,
      groupAsc: t('sortLabelTitleAsc'),
      groupDesc: t('sortLabelTitleDesc'),
    };
    selectOptions.forEach(sort => {
      if (/{\w+}/.test(sort)) {
        if (container) {
          renderBin.appendChild(container);
        }
        container = optgroup.cloneNode();
        container.label = meta[sort.substring(1, sort.length - 1)];
        return;
      }
      let lastTag = '';
      const opt = option.cloneNode();
      opt.textContent = sort.split(splitRegex).reduce((acc, val) => {
        if (tagData[val]) {
          lastTag = val;
          return acc + (acc !== '' ? ' + ' : '') + tagData[val].text;
        }
        if (lastTag.indexOf('date') > -1) return acc + meta[val === 'desc' ? 'dateNew' : 'dateOld'];
        if (lastTag === 'disabled') return acc + meta[val === 'desc' ? 'enabled' : 'disabled'];
        return acc + (meta[val] || '');
      }, '');
      opt.value = sort;
      container.appendChild(opt);
    });
    renderBin.appendChild(container);
    select.appendChild(renderBin);
    select.value = getPref();
  }

  return {

    init,

    sort(styles) {
      const sortBy = getPref().split(splitRegex);
      const len = sortBy.length;
      return styles.sort((a, b) => {
        let types, direction;
        let result = 0;
        let index = 0;
        // multi-sort
        while (result === 0 && index < len) {
          types = tagData[sortBy[index++]];
          direction = sortBy[index++] === 'asc' ? 1 : -1;
          result = types.sorter(types.parse(a), types.parse(b)) * direction;
        }
        return result;
      });
    },

    update() {
      if (!installed) return;
      const current = [...installed.children];
      const sorted = sorter.sort([...current]);
      if (current.some((el, i) => el !== sorted[i])) {
        installed.append(...sorted);
      }
      sorter.updateStripes();
    },

    updateStripes({onlyWhenColumnsChanged} = {}) {
      if (onlyWhenColumnsChanged && !updateColumnCount()) return;
      let index = 0;
      let isOdd = false;
      const flipRows = columns % 2 === 0;
      for (const {classList} of installed.children) {
        if (classList.contains('hidden')) continue;
        classList.toggle('odd', isOdd);
        classList.toggle('even', !isOdd);
        if (flipRows && ++index >= columns) {
          index = 0;
        } else {
          isOdd = !isOdd;
        }
      }
    },
  };

  function updateColumnCount() {
    const useStyle = [].some.call($.root.children,
      el => el.tagName === 'STYLE' && el.textContent.includes(COL_PROP + ':'));
    const v = useStyle ? Math.max(1, getComputedStyle($.root).getPropertyValue(COL_PROP) >> 0)
      : minWidth ? onResize()
        : columns;
    if (columns !== v) {
      columns = v;
      return true;
    }
  }

  function updateColumnWidth(_, val) {
    minWidth = Math.max(val, COL_MIN);
    if (val < COL_MAX) {
      window.on('resize', onResize);
    } else {
      window.off('resize', onResize);
      $.root.style.removeProperty(COL_PROP);
    }
    sorter.updateStripes({onlyWhenColumnsChanged: true});
  }

  function onResize(evt) {
    const c = Math.max(1, (window.innerWidth - dom.HWval) / minWidth >> 0);
    if (columns !== c) {
      $.root.style.setProperty(COL_PROP, c);
      if (evt) {
        columns = c;
        sorter.updateStripes();
      }
    }
    return c;
  }

  async function showHelp(event) {
    event.preventDefault();
    messageBoxProxy.show({
      className: 'help-text center-dialog',
      title: t('sortStylesHelpTitle'),
      contents:
        $create('div',
          t('sortStylesHelp').split('\n').map(line =>
            $create('p', line))),
      buttons: [t('confirmOK')],
    });
  }
})();
