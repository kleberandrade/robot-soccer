INSERT INTO teams(slug,name,strategy) VALUES
 ('balanced','Americana / Balanced','balanced'),('press','Circuit / Press','press')
ON CONFLICT(slug) DO UPDATE SET name=excluded.name,strategy=excluded.strategy;
