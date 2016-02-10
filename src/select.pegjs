{
  var parsers = {
    'id': require('./id'),
    'aggregate': require('./aggregate'),
    'filter': require('./filter'),
    'limit': require('./limit'),
    'order': require('./order'),
    'page': require('./page'),
    'search': require('./search')
  };

  function excludeSelect(key) {
    return (key !== 'select');
  }

  function mergeSelect(obj1, obj2) {
    for (var i in obj2) {
      // direct merge if obj2 is not selected in obj1
      if (!obj1[i]) {
        obj1[i] = obj2[i];
        continue;
      }

      // allow "a(b=c),a.d", but not "a(b=c),a(e=f)"
      if (Object.keys(obj1[i]).filter(excludeSelect).length +
        Object.keys(obj2[i]).filter(excludeSelect).length > 1) {
        throw new Error('Cannot merge options of "' + i + '"');
      }

      // merge properties
      for (var key in obj2[i]) {
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
}

// Select
select
  = head:attribute tail:(',' attribute)* {
      var obj = head;
      for (var i = 0; i < tail.length; i++) {
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
      var obj = head;
      for (var o in obj) {
        if (obj[o].select) {
          // single_attribute was "a[b,c]" => append to all
          for (var sub in obj[o].select) {
            obj[o].select[sub].select = tail;
          }
        } else {
          obj[o].select = tail;
        }
      }
      return obj;
    }

single_attribute
  = name:ident options:options sub:sub_select? {
      var obj = {};
      obj[name] = options;
      if (sub) obj[name].select = sub;
      return obj;
    }

sub_select
  = '[' sub:select ']' { return sub; }

// Attribute options
options
  = options:option* {
      var obj = {};
      for (var i = 0; i < options.length; i++) {
        obj[options[i][0]] = options[i][1];
      }
      return obj;
    }

option
  = '(' key:option_key '=' val:option_value ')' {
      if (parsers.hasOwnProperty(key)) return [key, parsers[key](val)];
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
  = quoted_string
  / parts:option_value_part+ { return parts.join(''); }

option_value_part
  = str:quoted_string { return '"' + str + '"'; }
  / chars:[^()"]+ { return chars.join(''); }

ident
  = chars:[A-Za-z0-9_*]+ { return chars.join(''); }

// String handling
quoted_string
  = '"' (ca:single_char*) '"' { return ca.join(''); }

single_char
  = escaped_quotes
  / [^"]

escaped_quotes
  = '\\"'  { return '"';  }
