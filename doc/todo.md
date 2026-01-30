### [perf] cache data and meta in the browser: faster reloads & fetch the diff only
meta
quotes
ttl based on meta.scraped-at

### refactor views
single key in localStorage
{ row, col, selected: { ac, row, col } }

### auto-repair local storage
schema of current version, default values per field, cleanup unknown fields

### click ticker
- list of links

### click cell on derived values should explain the calc (and give multiple links if needed)

### upgrade node and friends
also tsconfig.json target to ES2020 (+performance, less old browser compatibility)

### search tickers by key
e.g. lucro > X, top X lucro, ... 

### column-selector: group by source
still 2 levels: source and keys 
but subgroup keys and always expand them all
making sure top-level group has the check/semi-check

### [bug] zeros not being colored red
tag along, simplywall score

### [bug] showing "0" instead of "-"

### tone down colors for not-so-important cols
1A, 5A, listagem, ano

### add colors
patrimonio liquido, listagem, ano

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
