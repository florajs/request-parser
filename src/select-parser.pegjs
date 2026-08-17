{
  const parsers = {
    'id': require('../lib/id'),
    'aggregate': require('../lib/aggregate'),
    'filter': require('../lib/filter'),
    'limit': require('../lib/limit'),
    'order': require('../lib/order'),
    'page': require('../lib/page'),
    'search': require('../lib/search')
  };

  function mergeSelect(obj1, obj2) {
    for (const i of Object.keys(obj2)) {
      // direct merge if obj2 is not selected in obj1
      if (!obj1[i]) {
        obj1[i] = obj2[i];
        continue;
      }

      // allow "a(b=c),a.d", but not "a(b=c),a(e=f)"
      if (
        Object.keys(obj1[i]).some((key) => key !== 'select')
        && Object.keys(obj2[i]).some((key) => key !== 'select')
      ) {
        throw new Error('Cannot merge options of "' + i + '"');
      }

      // merge properties
      for (const key of Object.keys(obj2[i])) {
        if (key === 'select') {
          // merge subselects
          if (obj2[i].select) {
            if (!obj1[i].select) obj1[i].select = obj2[i].select;
            mergeSelect(obj1[i].select, obj2[i].select);
          }
        } else {
          // add options
          obj1[i][key] = obj2[i][key];
        }
      }
    }
    return obj1;
  }

  function getLeaves(select) {
    const leaves = [];
    for (const key of Object.keys(select)) {
      leaves.push(...(
        select[key].select
            ? getLeaves(select[key].select)
            : [select[key]]
        )
      );
    }
    return leaves;
  }
}

// Select
select
  = head:attribute tail:(',' attribute)* {
      let obj = head;
      for (let i = 0, len = tail.length; i < len; i++) {
        obj = mergeSelect(obj, tail[i][1]);
      }
      return obj;
    }

// Attributes
attribute
  = combined_attribute
  / attr:single_attribute

combined_attribute
  = head:single_attribute '.' tail:attribute {
      let obj = head;
      for (const o of Object.keys(obj)) {
        if (obj[o].select) {
          // single_attribute was "a[b,c]" => append to all leaves
          getLeaves(obj).forEach((sub) => {
            sub.select = tail;
          });
        } else {
          obj[o].select = tail;
        }
      }
      return obj;
    }

single_attribute
  = sub:sub_select
  / name:ident options:options sub:sub_select? {
      const obj = {};
      obj[name] = options;
      if (sub) obj[name].select = sub;
      return obj;
    }

sub_select
  = '[' select:select ']' sub:sub_select* {
      // "a[b,c][d,e]" => append "[d,e]" to each b and c:
      // Find all "leaves" of select (i.e. objects with no "select" property),
      // then append all sub nodes as new "select" property.
      getLeaves(select).forEach((obj) => {
        for (let i = 0, len = sub.length; i < len; i++) {
          obj.select = sub[i];
        }
      });
      return select;
    }

// Attribute options
options
  = options:option* {
      const obj = {};
      for (let i = 0, len = options.length; i < len; i++) {
        if (Object.hasOwn(obj, options[i][0])) {
            throw new Error('Cannot redefine option "' + options[i][0] + '"');
        }
        obj[options[i][0]] = options[i][1];
      }
      return obj;
    }

option
  = '(' key:option_key '=' val:option_value ')' {
      if (Object.hasOwn(parsers, key)) return [key, parsers[key](val)];
      return [key, val];
    }

option_key
  = 'id'
  / 'aggregate'
  / 'filter'
  / 'limit'
  / 'order'
  / 'page'
  / 'search'
  / ident // pass through unknown options

option_value
  = parts:option_value_part+ { return parts.join(''); }

option_value_part
  = quoted_string
  / balanced_parentheses
  / chars:[^()"]+ { return chars.join(''); }

ident
  = chars:[A-Za-z0-9_{}]+ { return chars.join(''); }

balanced_parentheses
  = '(' v:option_value_part+ ')' { return '(' + v.join('') + ')'; }

// String handling
quoted_string
  = '"' ca:single_char* '"' { return '"' + ca.join('') + '"'; }

single_char
  = escaped_quotes
  / [^"]

escaped_quotes
  = '\\"'  { return '\\"';  }
