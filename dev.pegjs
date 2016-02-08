// Select
select
  = head:attribute tail:(COMMA attribute)* {
      var obj = head;
      for (var i = 0; i < tail.length; i++) {
        var obj2 = tail[i][1]; // tail[i][0] is the COMMA
        for (var o in obj2) {
          obj[o] = obj2[o];
        }
      }
      return obj;
    }

// Attributes
attribute
  = combined_attribute
  / single_attribute

combined_attribute
  = head:single_attribute '.' tail:attribute {
    var obj = head;
    for (var o in obj) {
      obj[o].select = tail;
    }
    return obj;
  }

single_attribute
  = name:ident options:options {
    var obj = {};
    obj[name] = options;
    return obj;
  }

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
  = LPAREN key:option_key '=' val:option_value RPAREN {
    return [key, val];
    var obj = {};
    obj[key] = val;
    return obj;
  }

option_key = ident

option_value
  = quoted_string
  / parts:option_value_part+ { return parts.join('') }

option_value_part
  = str:quoted_string { return '"' + str + '"' }
  / chars:[^()"]+ { return chars.join('') }

COMMA = ','
LPAREN = '('
RPAREN = ')'

ident
  = chars:[A-Za-z0-9_]+ { return chars.join('') }

// String handling
quoted_string
  = '"' (ca:single_char*) '"' { return ca.join('') }

single_char
  = escaped_quotes
  / [^"]

escaped_quotes
  = '\\"'  { return '"';  }
