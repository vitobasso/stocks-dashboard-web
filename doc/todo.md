
### click cell on derived values should explain the calc (and give multiple links if needed)

### upgrade node and friends
also tsconfig.json target to ES2020 (+performance, less old browser compatibility)

### [bug] zeros not being colored red
tag along, simplywall score

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