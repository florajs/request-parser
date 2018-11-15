/* eslint global-require: 0 */

'use strict';

module.exports = {
    id: require('./lib/id'),
    aggregate: require('./lib/aggregate'),
    filter: require('./lib/filter'),
    limit: require('./lib/limit'),
    order: require('./lib/order'),
    page: require('./lib/page'),
    search: require('./lib/search'),
    select: require('./lib/select'),
    parse: require('./lib/parse')
};
