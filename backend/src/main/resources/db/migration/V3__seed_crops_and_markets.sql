INSERT INTO crops (crop_name)
SELECT 'Teff' WHERE NOT EXISTS (SELECT 1 FROM crops WHERE crop_name = 'Teff');
INSERT INTO crops (crop_name)
SELECT 'Maize' WHERE NOT EXISTS (SELECT 1 FROM crops WHERE crop_name = 'Maize');
INSERT INTO crops (crop_name)
SELECT 'Wheat' WHERE NOT EXISTS (SELECT 1 FROM crops WHERE crop_name = 'Wheat');
INSERT INTO crops (crop_name)
SELECT 'Sorghum' WHERE NOT EXISTS (SELECT 1 FROM crops WHERE crop_name = 'Sorghum');
INSERT INTO crops (crop_name)
SELECT 'Coffee' WHERE NOT EXISTS (SELECT 1 FROM crops WHERE crop_name = 'Coffee');

INSERT INTO markets (market_name)
SELECT 'National' WHERE NOT EXISTS (SELECT 1 FROM markets WHERE market_name = 'National');
