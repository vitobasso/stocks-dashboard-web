### next/codemod warnings
npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
npm warn deprecated cross-spawn-async@2.2.5: cross-spawn no longer requires a build toolchain, use it instead
npm warn deprecated rimraf@2.6.3: Rimraf versions prior to v4 are no longer supported
npm warn deprecated glob@7.2.3: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Supp

### click cell on derived values should explain the calc (and give multiple links if needed)

### [bug] showing "0" instead of "-"

### tone down colors for not-so-important cols
1A, 5A, listagem, ano

### add colors
patrimonio liquido, listagem, ano

### [refactor] labeler context ?

### search tickers by key
e.g. lucro > X, top X lucro, ... 

### col-dialog: click column-orderer item to find it (auto-expand and highlight) in column-selector 

### calc projecao: aggregate yahoo + tradingview

### import b3 automatically

### views
duplicate
reorder tabs

### when importing b3, add all tickers (ask confirmation)

### order by multi cols

### customize: color rules ?

### customize: calculated columns ?

### color depending on other keys
price color depends on industry or avg of industry

### test
column-selector search

### other data presentations
- aggregate per sector: total position or return
- diff today vs last month
- time series
- bubble plot: return * age * position, return * risk * position  
- bubble plot: price * quality * size,  EBIT/EV * ROIC * market cap, P/E * EPS * size

### [perf] tune nginx to not leak mem (i restarted and api got faster)

### [perf] batch call to /data ?

### persist cache across refreshes ?
ttl based on meta.scraped-at