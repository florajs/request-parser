# flora-request-parser

![](https://github.com/godmodelabs/flora-request-parser/workflows/ci/badge.svg)
[![NPM version](https://img.shields.io/npm/v/flora-request-parser.svg?style=flat)](https://www.npmjs.com/package/flora-request-parser)
[![NPM downloads](https://img.shields.io/npm/dm/flora-request-parser.svg?style=flat)](https://www.npmjs.com/package/flora-request-parser)

Parse [Flora](https://github.com/godmodelabs/flora) requests into the internal object format.

## Usage

```js
const { parse } = require('flora-request-parser');

parse({
    id: 42,
    limit: 100,
    page: 10,
    order: 'lastname:asc',
    search: 'foo',
    select: 'id,firstname,lastname,address[street,zip]',
    filter: 'address.zip=1234',
});
```

### Order syntax

```
lastname:asc
lastname:desc
firstname:asc,lastname:desc
:random
```

### Select syntax

Simple attributes:

```
firstname,lastname
```

Children attributes:

```
firstname,lastname,address.street,address.zip
firstname,lastname,address[street,zip]
```

Additional parameters for children:

```
address(filter=active=true AND zip>10000)[street,zip]
subscriptions(filter=active=true)(order=createdAt:desc)[id,name,product.id]
```

### Filter syntax

Filter by single attribute:

```
type.id=1
```

Filter by multiple values (OR):

```
type.id=1,2,3
```

Filter by multiple attributes (AND):

```
type.id=1 AND categories.id=2
```

Filter by multiple attributes (OR):

```
type.id=1 OR categories.id=2
```

Complex examples with parenthesis:

```
(type.id=1,2,3 OR countries.id=3,23) AND categories.id=2,65'
```

Ranges (10 <= foo <= 20):

```
foo=10..20
```

## License

[MIT](LICENSE)
